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
        flex: 0.125,
        type: 'date',
        minWidth: 50,
        headerName: 'Violation Date',
        field: 'violation_date',
        valueGetter: params => new Date(params.value),
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {formatDate(params.row.violation_date)}
            </Typography>
        )
    },
    {
        flex: 0.2,
        minWidth: 200,
        field: 'violations',
        headerName: 'Violations',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.violations}
            </Typography>
        )
    }
]

const SpeedTable = ({ data, paginationModel, total, setPaginationModel }:
    {
        data: any[],
        total: number,
        paginationModel: { page: number, pageSize: number },
        setPaginationModel: ({ page, pageSize }: { page: number, pageSize: number }) => void;
    }) => {

    return (
        <Card>
            <CardHeader title='Speed Violation Report' />
            <Box sx={{ height: 600 }}>
                <DataGrid
                    pagination
                    rows={data}
                    getRowId={(row) => row.address}
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

export default SpeedTable
