// ** Redux Imports
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import apiConfig from 'src/configs/apiConfig'

interface DataMapParams {
    startDate: string
    endDate: string
    coordinates: string
}


export const findRoutes = createAsyncThunk('navigation/safeRoute', async (params: DataMapParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/navigation`, {
        params
    })

    return response.data
})


export const navigationSlice = createSlice({
    name: 'navigation',
    initialState: {
        data: {}
    },
    reducers: {}
})

export default navigationSlice.reducer
