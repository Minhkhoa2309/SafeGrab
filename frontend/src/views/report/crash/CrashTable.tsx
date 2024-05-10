// ** MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

// ** Types Imports
import { Box } from '@mui/material'
import { formatDate } from 'src/layouts/utils/format'

const columns: GridColDef[] = [
    {
        flex: 0.125,
        minWidth: 50,
        field: 'street_name',
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
        field: 'crash_date',
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

const CrashTable = ({ data, paginationModel, total, setPaginationModel }:
    {
        data: any[],
        total: number,
        paginationModel: { page: number, pageSize: number },
        setPaginationModel: ({ page, pageSize }: { page: number, pageSize: number }) => void;
    }) => {

    return (
        <Card>
            <CardHeader title='Crash Report' />
            <Box sx={{ height: 600 }}>
                <DataGrid
                    pagination
                    rows={data}
                    getRowId={(row) => row.crash_record_id}
                    rowCount={total}
                    columns={columns}
                    paginationMode='server'
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            </Box>
        </Card>
    )
}

export default CrashTable
