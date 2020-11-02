import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { auth, storage, googleAuthProvider } from '../firebase'
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Paper,
    Grid,
    Typography,
    makeStyles,
    Modal,
    IconButton,
    Box,
} from '@material-ui/core'
import {
    Send,
    Camera,
    Email,
    LockOutlined,
    AccountCircle,
} from '@material-ui/icons'

import styles from './Auth.module.css'
import { AppDispatch } from '../app/store'
import { updateUserProfile } from '../features/userSlice'

const getModalStyle = () => {
    const top = 50
    const left = 50

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        height: "100vh"
    },
    modal: {
        outline: "none",
        position: "absolute",
        width: 400,
        borderRadius: 10,
        backgroundColor: "white",
        boxShadow: theme.shadows[5],
        padding:theme.spacing(10)
    },
    image: {
        backgroundImage:
            "url(https://images.unsplash.com/photo-1581784368651-8916092072cf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80)",
        backgroundRepeat: "no-repeat",
        backgroundColor:
            theme.palette.type === "light"
            ? theme.palette.grey[50]
            : theme.palette.grey[900],
        backgroundSize: "cover",
        backgroundPosition: "center"
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
}))

const Auth: React.FC = () => {
    const classes = useStyles()
    const dispatch: AppDispatch = useDispatch()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ username, setUsername ] = useState("")
    const [ avatarImage, setAvatarImage ] = useState<File | null>(null)
    const [ isLogin, setIsLogin ] = useState(true)
    const [ openModal, setOpenModal ] = React.useState(false)
    const [ resetEmail, setResetEmail ] = useState("")

    const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files![0]) {
            setAvatarImage(e.target.files![0])
            e.target.value = ""
        }
    }

    const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
        await auth.sendPasswordResetEmail(resetEmail).then(() => {
            setOpenModal(false)
            setResetEmail("")
        }).catch(error => {
            alert(error.message)
            setResetEmail("")
        })
    }

    const signInGoogle = async () => {
        await auth.signInWithPopup(googleAuthProvider).catch(error => alert(error.message))
    }

    const signInEmail = async () => {
        await auth.signInWithEmailAndPassword(email, password)
    }

    const signUpEmail = async () => {
        const authUser = await auth.createUserWithEmailAndPassword(email, password)
        let url = ""
        if (avatarImage) {
            const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            const N = 16
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
                .map(n => S[n % S.length]).join("")
            const fileName = randomChar + "_" + avatarImage.name
            await storage.ref(`avatars/${fileName}`).put(avatarImage)
            url = await storage.ref("avatars").child(fileName).getDownloadURL()
        }
        await authUser.user?.updateProfile({
            displayName: username,
            photoURL: url,
        })
        dispatch(updateUserProfile({
            displayName: username,
            photoUrl: url,
        }))
    }

    const isDisabled = isLogin
                        ? !email || password.length < 6
                        : !username || !email || password.length < 6 || !avatarImage

    return (
        <Grid className={classes.root} container component="main">
            <CssBaseline />
            <Grid className={classes.image} item xs={false} sm={4} md={7} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {isLogin ? "Login" : "Register"}
                    </Typography>
                    <form className={classes.form} noValidate>
                        {!isLogin && (
                            <>
                            <TextField
                                variant="outlined" margin="normal" required fullWidth
                                id="username" label="Username" name="username" autoComplete="username"
                                autoFocus value={username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setUsername(e.target.value)
                                }}
                            />
                            <Box textAlign="center">
                                <IconButton>
                                    <label>
                                        <AccountCircle
                                            fontSize="large"
                                            className={
                                                avatarImage
                                                    ? styles.login_addIconLoaded
                                                    : styles.login_addIcon
                                            }
                                        />
                                        <input
                                            className={styles.login_hiddenIcon} type="file"
                                            onChange={onChangeImageHandler}
                                        />
                                    </label>
                                </IconButton>
                            </Box>
                            </>
                        )}
                        <TextField
                            variant="outlined" margin="normal" required fullWidth
                            id="email" label="Email Address" name="email" autoComplete="email"
                            autoFocus value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setEmail(e.target.value)
                            }}
                        />
                        <TextField
                            variant="outlined" margin="normal" required fullWidth
                            id="password" label="Password(6 characters or more)" name="password" autoComplete="current-password"
                            type="password" autoFocus value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(e.target.value)
                            }}
                        />
                        <Button
                            className={classes.submit} variant="contained" disabled={isDisabled}
                            color="primary" fullWidth startIcon={<Email />}
                            onClick={
                                isLogin
                                    ? async () => {
                                        try {
                                            await signInEmail()
                                        } catch (error) {
                                            alert(error.message)
                                        }
                                    }
                                    : async () => {
                                        try {
                                            await signUpEmail()
                                        } catch (error) {
                                            alert(error.message)
                                        }
                                    }
                            }
                        >
                            {isLogin ? "Login" : "Register"}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <span
                                    className={styles.login_reset}
                                    onClick={() => setOpenModal(true)}
                                >
                                    Forget password ?
                                </span>
                            </Grid>
                            <Grid item>
                                <span
                                    className={styles.login_toggleMode}
                                    onClick={() => setIsLogin(!isLogin)}
                                >
                                    {isLogin ? "Create new account ?" : "Back to login"}
                                </span>
                            </Grid>
                        </Grid>
                        <Button
                            className={classes.submit} variant="contained" color="default"
                            fullWidth startIcon={<Camera />} onClick={signInGoogle}
                        >
                            Sign with Google
                        </Button>
                    </form>
                    <Modal open={openModal} onClose={() => setOpenModal(false)}>
                        <div className={classes.modal} style={getModalStyle()}>
                            <div className={styles.login_modal}>
                                <TextField
                                    type="email" label="Reset Email" name="email"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setResetEmail(e.target.value)
                                    }}
                                />
                                <IconButton onClick={sendResetEmail}>
                                    <Send />
                                </IconButton>
                            </div>
                        </div>
                    </Modal>
                </div>
            </Grid>
        </Grid>
    )
}

export default Auth
