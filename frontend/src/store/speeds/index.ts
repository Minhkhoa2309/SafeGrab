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
}
interface DataTableParams {
    startDate: string
    endDate: string
    pageSize: number
    pageIndex: number
}


// ** Fetch speed information
export const fetchDataTable = createAsyncThunk('speeds/fetchDataTable', async (params: DataTableParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/speeds/table`, {
        params
    })
    

    return response.data
})

export const fetchDataMap = createAsyncThunk('speeds/fetchDataMap', async (params: DataMapParams) => {
    const response = await axios.get(`${apiConfig.apiEndpoint}/speeds/map`, {
        params
    })

    return response.data
})

export const speedSlice = createSlice({
    name: 'speeds',
    initialState: {
        data: [],
        total: 1
    },
    reducers: {},
    extraReducers: builder => {
      builder.addCase(fetchDataTable.fulfilled, (state, action) => {
        state.data = action.payload.violations
        state.total = action.payload.total
      })
    }
})

export default speedSlice.reducer
