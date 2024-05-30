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

interface DataCountParams {
    startDate: string;
    endDate: string;
    streetName?: string;
}

export const fetchDataMap = createAsyncThunk('crash/fetchDataMap', async (params: DataMapParams) => {
    try {
        const { startDate, endDate, gridSize, boundingBox, streetName } = params;

        let query = `select snap_to_grid(\`location\`,${gridSize}),min(\:id) as __row_id__,count(*) as total where intersects(location, ${boundingBox}) AND \`crash_date\` >= '${startDate}' AND \`crash_date\` < '${endDate}'`;

        if (streetName) {
            query += ` AND (\`street_name\` = '${streetName}')`;
        }

        query += ` group by snap_to_grid(\`location\`,${gridSize}) limit 50000`;

        const response = await axios.get(`${apiConfig.apiEndpoint}/resource/85ca-t3if.geojson`, {
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

export const fetchDataTable = createAsyncThunk('crash/fetchDataTable', async (params: DataTableParams) => {
    try {
        const { startDate, endDate, pageSize, pageIndex, streetName } = params;

        const whereClause = streetName ? 
            "`crash_date` >= '" + startDate + "' AND `crash_date` < '" + endDate + "' AND (`street_name` = '" + streetName + "')" :
            "`crash_date` >= '" + startDate + "' AND `crash_date` < '" + endDate + "'";

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/85ca-t3if.json`, {
            params: {
                $select: '*',
                $order: 'crash_date DESC, crash_record_id ASC',
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

export const fetchStreetNames = createAsyncThunk('crash/fetchStreetNames', async () => {
    try {
        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/85ca-t3if.json`, {
            params: {
                $query: "SELECT `street_name`, count(`street_name`) as `total` GROUP BY `street_name` ORDER BY `total` desc",
                $$read_from_nbe: true,
                $$version: '2.1'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
})


export const fetchDataCount = createAsyncThunk('crash/fetchDataCount', async (params: DataCountParams) => {
    try {
        const { startDate, endDate, streetName } = params;

        let whereClause = `\`crash_date\` >= '${startDate}' AND \`crash_date\` < '${endDate}'`;
        if (streetName) {
            whereClause += ` AND (\`street_name\` = '${streetName}')`;
        }

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/85ca-t3if.json`, {
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


export const crashSlice = createSlice({
    name: 'crashes',
    initialState: {
        data: [],
        total: 0
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

export default crashSlice.reducer
