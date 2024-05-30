// ** React imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box } from '@mui/material'

// ** Utils Imports
import { formatDate } from 'src/layouts/utils/format'
import { AppDispatch, RootState } from 'src/store'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDataCount, fetchDataTable } from 'src/store/crashes'
import { DateType } from 'src/types/DatepickerTypes'
import { format } from 'date-fns'

const columns: GridColDef[] = [
    {
        flex: 0.125,
        minWidth: 50,
        field: 'streetName',
        headerName: 'Street Name',
        renderCell: (params: GridRenderCellParams) => {
            const { row } = params

            return (
                <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.street_name}
                </Typography>
            )
        }
    },
    {
        flex: 0.125,
        type: 'date',
        minWidth: 50,
        headerName: 'Date',
        field: 'crashDate',
        valueGetter: params => new Date(params.value),
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {formatDate(params.row.crash_date)}
            </Typography>
        )
    },
    {
        flex: 0.2,
        minWidth: 200,
        field: 'crash_type',
        headerName: 'Crash Type',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.crash_type}
            </Typography>
        )
    },
    {
        flex: 0.125,
        field: 'weather_condition',
        minWidth: 80,
        headerName: 'Weather Condition',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.weather_condition}
            </Typography>
        )
    },
    {
        flex: 0.2,
        field: 'lighting_condition',
        minWidth: 300,
        headerName: 'Lighting Condition',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.lighting_condition}
            </Typography>
        )
    }
]

interface filterProps {
    startDate: DateType
    endDate: DateType
    streetName?: string
}

const CrashTable = ({ startDate, endDate, streetName }: filterProps) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [loading, setLoading] = useState<boolean>(false);

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.crashes)

    useEffect(() => {
        if (!startDate || !endDate) {
            return;
        }
        setLoading(true);
        const formattedStartDate = format(startDate as Date | number, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate as Date | number, 'yyyy-MM-dd');
        dispatch(
            fetchDataTable({
                pageIndex: paginationModel.page,
                pageSize: paginationModel.pageSize,
                streetName: streetName,
                startDate: formattedStartDate,
                endDate: formattedEndDate
            })
        )
        dispatch(
            fetchDataCount({
                streetName: streetName,
                startDate: formattedStartDate,
                endDate: formattedEndDate
            })
        )
        setLoading(false);
    }, [dispatch, startDate, endDate, streetName, paginationModel])

    return (
        <Box sx={{ height: 600 }}>
            <DataGrid
                pagination
                rows={store.data}
                getRowId={(row) => row.crash_record_id}
                rowCount={store.total}
                columns={columns}
                paginationMode='server'
                pageSizeOptions={[25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={loading}
            />
        </Box>
    )
}

export default CrashTable
