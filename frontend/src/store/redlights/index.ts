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

interface DataCountParams {
    startDate: string;
    endDate: string;
    intersection?: string;
}

// ** Fetch redlight information
export const fetchDataTable = createAsyncThunk('redlights/fetchDataTable', async (params: DataTableParams) => {
    try {
        const { startDate, endDate, pageSize, pageIndex, intersection } = params;

        const whereClause = intersection ? 
            "`violation_date` >= '" + startDate + "' AND `violation_date` < '" + endDate + "' AND (`intersection` = '" + intersection + "')" :
            "`violation_date` >= '" + startDate + "' AND `violation_date` < '" + endDate + "'";

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/spqx-js37.json`, {
            params: {
                $select: '*',
                $order: '`violation_date` DESC, `intersection` ASC',
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

export const fetchDataMap = createAsyncThunk('redlights/fetchDataMap', async (params: DataMapParams) => {
    try {
        const { startDate, endDate, gridSize, boundingBox, intersection } = params;

        let query = `select snap_to_grid(\`location\`,${gridSize}),min(\:id) as __row_id__,count(*) as total where intersects(location, ${boundingBox}) AND \`violation_date\` >= '${startDate}' AND \`violation_date\` < '${endDate}'`;

        if (intersection) {
            query += ` AND (\`intersection\` = '${intersection}')`;
        }

        query += ` group by snap_to_grid(\`location\`,${gridSize}) limit 50000`;

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

export const fetchIntersection = createAsyncThunk('redlights/fetchIntersection', async () => {
    try {
        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/spqx-js37.json`, {
            params: {
                $query: "SELECT `intersection`, count(`intersection`) as `total` GROUP BY `intersection` ORDER BY `total` desc",
                $$read_from_nbe: true,
                $$version: '2.1'
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
})


export const fetchDataCount = createAsyncThunk('redlights/fetchDataCount', async (params: DataCountParams) => {
    try {
        const { startDate, endDate, intersection } = params;

        let whereClause = `\`violation_date\` >= '${startDate}' AND \`violation_date\` < '${endDate}'`;
        if (intersection) {
            whereClause += ` AND (\`intersection\` = '${intersection}')`;
        }

        const response = await axios.get(`${apiConfig.apiEndpoint}/api/id/spqx-js37.json`, {
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

export const redlightSlice = createSlice({
    name: 'redlights',
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

export default redlightSlice.reducer
