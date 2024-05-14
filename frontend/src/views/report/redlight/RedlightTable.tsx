// ** React imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box } from '@mui/material'

// ** Utils Imports
import { formatDate } from 'src/layouts/utils/format'

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
                {formatDate(params.row.violation_date)}
            </Typography>
        )
    },
    {
        flex: 0.125,
        minWidth: 50,
        field: 'violations',
        headerName: 'Violations',
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {params.row.violations}
            </Typography>
        )
    }
]

const RedlightTable = () => {
    const [rows, setRows] = useState<any[]>([])
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
    const [total, setTotal] = useState<number>(0)

    const fetchTableData = useCallback(async () => {
        await fetch(
            `https://data.cityofchicago.org/resource/spqx-js37.json?$limit=${paginationModel.pageSize}&$offset=${paginationModel.page}`
        )
            .then(response => response.json())
            .then(data => {
                setRows(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [paginationModel]);

    const fetchTotalCount = useCallback(async () => {
        await fetch(
            `https://data.cityofchicago.org/resource/spqx-js37.json?$select=count(*) as total`
        ).then(response => response.json())
            .then(data => {
                setTotal(Number(data[0].total))
            })
            .catch(error => {
                console.error('Error fetching Total:', error);
            });
    }, [])

    useEffect(() => {
        fetchTotalCount();
        fetchTableData();
    }, [fetchTotalCount, fetchTableData, paginationModel])


    return (
        <Box sx={{ height: 600 }}>
            <DataGrid
                pagination
                rows={rows}
                getRowId={(row) => row.address}
                rowCount={total}
                columns={columns}
                paginationMode='server'
                pageSizeOptions={[25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />
        </Box>
    )
}

export default RedlightTable
