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
import { fetchDataTable } from 'src/store/redlights'
import { DateType } from 'src/types/DatepickerTypes'
import { format } from 'date-fns'

const columns: GridColDef[] = [
    {
        flex: 0.2,
        minWidth: 50,
        field: 'address',
        headerName: 'Address',
        renderCell: (params: GridRenderCellParams) => {
            const { row } = params

            return (
                <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.address}
                </Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 250,
        field: 'intersection',
        headerName: 'Intersection',
        renderCell: (params: GridRenderCellParams) => {
            const { row } = params

            return (
                <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.intersection}
                </Typography>
            )
        }
    },
    {
        flex: 0.125,
        type: 'date',
        minWidth: 50,
        headerName: 'Violation Date',
        field: 'violation_date',
        valueGetter: params => new Date(params.value),
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {formatDate(params.row.violationDate)}
            </Typography>
        )
    },
    {
        flex: 0.125,
        minWidth: 50,
        field: 'violationCount',
        headerName: 'Violations Count',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.violationCount}
            </Typography>
        )
    }
]

interface filterProps {
    startDate: DateType
    endDate: DateType
    intersection?: string
}

const RedlightTable = ({ startDate, endDate, intersection }: filterProps) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
    const [loading, setLoading] = useState<boolean>(false);

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.redlights)

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
                intersection: intersection,
                startDate: formattedStartDate,
                endDate: formattedEndDate
            })
        )
        setLoading(false);
    }, [dispatch, startDate, endDate, intersection, paginationModel])


    return (
        <Box sx={{ height: 600 }}>
            <DataGrid
                pagination
                rows={store.data}
                getRowId={(row) => row.id}
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

export default RedlightTable
