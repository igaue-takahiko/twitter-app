import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, makeStyles } from '@material-ui/core'
import { Message, Send } from '@material-ui/icons'

import styles from './Post.module.css'
import { db, timestamp } from '../firebase'
import { selectUser } from '../features/userSlice'
import { PROPS, COMMENT } from './types'

const useStyles = makeStyles(theme => ({
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginRight: theme.spacing(1),
    }
}))

const Post: React.FC<PROPS> = (props) => {
    const classes = useStyles()
    const user = useSelector(selectUser)

    const [ openComments, setOpenComments ] = useState(false)
    const [ comment, setComment ] = useState("")
    const [ comments, setComments ] = useState<COMMENT[]>([
        {
            id: "",
            avatar: "",
            text: "",
            username: "",
            timestamp: null
        }
    ])

    const newCommit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        db.collection("posts").doc(props.postId).collection("comments").add({
            avatar: user.photoUrl,
            text: comment,
            timestamp: timestamp,
            username: user.displayName,
        })
        setComment("")
    }

    useEffect(()=> {
        const unSub = db.collection("posts").doc(props.postId)
            .collection("comments").orderBy("timestamp", "desc").onSnapshot(snapshot => {
                setComments(snapshot.docs.map(doc => ({
                    id: doc.id,
                    avatar: doc.data().avatar,
                    text: doc.data().text,
                    username: doc.data().username,
                    timestamp: doc.data().timestamp,
                })))
            })
            return () => unSub()
    },[props.postId])

    return (
        <div className={styles.post}>
            <div className={styles.post_avatar}>
                <Avatar src={props.avatar}/>
            </div>
            <div className={styles.post_body}>
                <div>
                    <div className={styles.post_header}>
                        <h3>
                            <span className={styles.post_headerUser}>@{props.username}</span>
                            <span className={styles.post_headerTime}>
                                {new Date(props.timestamp?.toDate()).toLocaleString()}
                            </span>
                        </h3>
                    </div>
                    <div className={styles.post_tweet}>
                        <p>{props.text}</p>
                    </div>
                </div>
                {props.image && (
                    <div className={styles.post_tweetImage}>
                        <img src={props.image} alt="tweet"/>
                    </div>
                )}
                <Message
                    className={styles.post_commentIcon}
                    onClick={() => setOpenComments(!openComments)}
                />
                {openComments && (
                    <>
                        {comments.map(comment => (
                            <div className={styles.post_comment} key={comment.id}>
                                <Avatar className={classes.small} src={comment.avatar} />
                                <span className={styles.post_commentUser}>@{comment.username}</span>
                                <span className={styles.post_commentText}>{comment.text}</span>
                                <span className={styles.post_headerTime}>
                                    {new Date(comment.timestamp?.toDate()).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        <form onSubmit={newCommit}>
                            <div className={styles.post_form}>
                                <input
                                    className={styles.post_input} value={comment}
                                    type="text" placeholder="Type new comment..."
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setComment(e.target.value)
                                    }}
                                />
                                <button
                                    type="submit" disabled={!comment}
                                    className={
                                        comment ? styles.post_button : styles.post_buttonDisable
                                    }
                                >
                                    <Send className={styles.post_sendIcon} />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

export default Post
