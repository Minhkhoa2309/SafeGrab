// ** Redux Imports
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import apiConfig from 'src/configs/apiConfig'

interface DataMapParams {
    startDate: string
    endDate: string
    gridSize: number
    boundingBox: string
    streetName?: string
}
interface DataTableParams {
    startDate: string
    endDate: string
    pageSize: number
    pageIndex: number
    streetName?: string
}


export const fetchDataMap = createAsyncThunk('crash/fetchDataMap', async (params: DataMapParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/crashes/map`, {
        params
    })

    return response.data
})

export const fetchDataTable = createAsyncThunk('crash/fetchDataTable', async (params: DataTableParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/crashes/table`, {
        params
    })
    
    return response.data
})

export const fetchStreetNames = createAsyncThunk('crash/fetchStreetNames', async () => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/crashes/streetnames`)
    
    return response.data
})


export const crashSlice = createSlice({
    name: 'crashes',
    initialState: {
        data: [],
        total: 0
    },
    reducers: {},
    extraReducers: builder => {
      builder.addCase(fetchDataTable.fulfilled, (state, action) => {
        state.data = action.payload.crashes
        state.total = action.payload.total
      })
    }
})

export default crashSlice.reducer
