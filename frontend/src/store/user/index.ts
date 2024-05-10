// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'


export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {}
})

export default appUsersSlice.reducer
