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
interface DataCountParams {
    startDate: string;
    endDate: string;
}

//hhkd-xvj4
// ** Fetch speed information
export const fetchDataTable = createAsyncThunk('speeds/fetchDataTable', async (params: DataTableParams) => {
    try {
        const { startDate, endDate, pageSize, pageIndex } = params;

        const whereClause = "`violation_date` >= '" + startDate + "' AND `violation_date` < '" + endDate + "'";

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/hhkd-xvj4.json`, {
            params: {
                $select: '*',
                $order: '`violation_date` DESC',
                $limit: pageSize,
                $offset: pageIndex,
                $where: whereClause,
                $$read_from_nbe: true,
                $$version: '2.1'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
})

export const fetchDataMap = createAsyncThunk('speeds/fetchDataMap', async (params: DataMapParams) => {
    try {
        const { startDate, endDate, gridSize, boundingBox } = params;

        let query = `select snap_to_grid(\`location\`,${gridSize}),min(\:id) as __row_id__,count(*) as total where intersects(location, ${boundingBox}) AND \`violation_date\` >= '${startDate}' AND \`violation_date\` < '${endDate}'  group by snap_to_grid(\`location\`,${gridSize}) limit 50000`;

        const response = await axios.get(`${apiConfig.apiEndpoint}/resource/spqx-js37.geojson`, {
            params: {
                $query: query,
                $$query_timeout_seconds: 60,
                $$read_from_nbe: true,
                $$version: '2.1',
                $$app_token: 'U29jcmF0YS0td2VraWNrYXNz0'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
})

export const fetchDataCount = createAsyncThunk('speeds/fetchDataCount', async (params: DataCountParams) => {
    try {
        const { startDate, endDate } = params;

        let whereClause = `\`violation_date\` >= '${startDate}' AND \`violation_date\` < '${endDate}'`;

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/hhkd-xvj4.json`, {
            params: {
                $select: 'count(*) as total',
                $where: whereClause,
                $$read_from_nbe: true,
                $$version: '2.1'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
});

export const speedSlice = createSlice({
    name: 'speeds',
    initialState: {
        data: [],
        total: 1
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchDataTable.fulfilled, (state, action) => {
            state.data = action.payload
        }),
        builder.addCase(fetchDataCount.fulfilled, (state, action) => {
            state.total = Number(action.payload[0].total)
        })
    }
})

export default speedSlice.reducer
