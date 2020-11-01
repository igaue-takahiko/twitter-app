import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { auth } from './firebase'

import styles from './App.module.css'
import { AppDispatch } from './app/store'
import { selectUser, login, logout } from './features/userSlice'
import { Auth, Feed } from './components'

const App: React.FC = () => {
    const user = useSelector(selectUser)
    const dispatch: AppDispatch = useDispatch()

    useEffect(() => {
        const unSub = auth.onAuthStateChanged(authUser => {
            if (authUser) {
                dispatch(
                    login({
                        uid: authUser.uid,
                        photoUrl: authUser.photoURL,
                        displayName: authUser.displayName,
                    })
                )
            } else {
                dispatch(logout())
            }
        })
        return () => unSub()
    },[dispatch])

    return (
        <>
            {user.uid ? (
                <div className={styles.app}>
                    <Feed />
                </div>
            ) : (
                <Auth />
            )}
        </>
    )
}

export default App
