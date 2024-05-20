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
    intersection?: string
}
interface DataTableParams {
    startDate: string
    endDate: string
    pageSize: number
    pageIndex: number
    intersection?: string
}


// ** Fetch redlight information
export const fetchDataTable = createAsyncThunk('redlights/fetchDataTable', async (params: DataTableParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/redlights/table`, {
        params
    })
    

    return response.data
})

export const fetchDataMap = createAsyncThunk('redlights/fetchDataMap', async (params: DataMapParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/redlights/map`, {
        params
    })

    return response.data
})

export const fetchIntersection = createAsyncThunk('redlights/fetchIntersection', async () => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/redlights/intersections`)
    
    return response.data
})

export const redlightSlice = createSlice({
    name: 'redlights',
    initialState: {
        data: [],
        total: 0
    },
    reducers: {},
    extraReducers: builder => {
      builder.addCase(fetchDataTable.fulfilled, (state, action) => {
        state.data = action.payload.violations
        state.total = action.payload.total
      })
    }
})

export default redlightSlice.reducer
