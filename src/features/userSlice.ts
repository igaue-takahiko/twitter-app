import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../app/store'

export const initialState = {
    user: {
        uid: "",
        photoUrl: "",
        displayName: "",
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload
        },
        logout: (state, action) => {
            state.user = { uid: "", photoUrl: "", displayName: "" }
        }
    }
})

export const { login, logout } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer
