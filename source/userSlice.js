import { createSlice } from '@reduxjs/toolkit'

const {
    reducer,
    actions: {
        setUser,
        setUsers
    }
} = createSlice({
    name: 'user',
    initialState: {
        user: null,
        users: []
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setUsers: (state, action) => {
            state.users = action.payload
        }
    }
})

export default reducer
export {
    setUser,
    setUsers
}
