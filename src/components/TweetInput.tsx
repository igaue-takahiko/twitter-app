import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, Button, IconButton } from '@material-ui/core'
import firebase from 'firebase/app'
import { AddAPhoto } from '@material-ui/icons'

import styles from './TweetInput.module.css'
import { storage, db, auth, timestamp } from '../firebase'
import { selectUser } from '../features/userSlice'

const TweetInput: React.FC = () => {
    const user = useSelector(selectUser)

    const [ tweetImage, setTweetImage ] = useState<File | null>(null)
    const [ tweetMessage, setTweetMessage ] = useState("")

    const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files![0]) {
            setTweetImage(e.target.files![0])
            e.target.value = ""
        }
    }

    const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (tweetImage) {
            const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            const N = 16
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
                .map(n => S[n % S.length]).join("")
            const fileName = randomChar + "_" + tweetImage.name
            const uploadTweetImage = storage.ref(`images/${fileName}`).put(tweetImage)
            uploadTweetImage.on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                () => {},
                error => {
                    alert(error.message)
                },
                async () => {
                    await storage.ref("images").child(fileName).getDownloadURL().then(async url => {
                        await db.collection("posts").add({
                            avatar: user.photoUrl,
                            image: url,
                            text: tweetMessage,
                            timestamp: timestamp,
                            username: user.displayName
                        })
                    })
                }
            )
        } else {
            db.collection("posts").add({
                avatar: user.photoUrl,
                image: "",
                text: tweetMessage,
                timestamp: timestamp,
                username: user.displayName,
            })
        }
        setTweetImage(null)
        setTweetMessage("")
    }

    return (
        <>
            <form onSubmit={sendTweet}>
                <div className={styles.tweet_form}>
                    <Avatar
                        className={styles.tweet_avatar} src={user.photoUrl}
                        onClick={async () => await auth.signOut()}
                    />
                    <input
                        className={styles.tweet_input} placeholder="What's happening ?"
                        type="text" autoFocus value={tweetMessage}
                        onChange={e => setTweetMessage(e.target.value)}
                    />
                    <IconButton>
                        <label>
                            <AddAPhoto
                                className={
                                    tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                                }
                            />
                            <input
                                className={styles.tweet_hiddenIcon} type="file"
                                onChange={onChangeImageHandler}
                            />
                        </label>
                    </IconButton>
                </div>
                <Button
                    className={
                        tweetMessage ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
                    }
                    type="submit" disabled={!tweetMessage}
                >
                    Tweet
                </Button>
            </form>
        </>
    )
}

export default TweetInput
