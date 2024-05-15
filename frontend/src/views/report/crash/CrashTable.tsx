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

const CrashTable = ({ filter }: { filter: string }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTableData = useCallback(async () => {
        setLoading(true);
        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.json?$limit=${paginationModel.pageSize}&$offset=${paginationModel.page * paginationModel.pageSize}&$where=${encodeURIComponent(filter)}`
        )
            .then(response => response.json())
            .then(data => {
                setRows(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        setLoading(false);
    }, [paginationModel, filter]);

    const fetchTotalCount = useCallback(async () => {

        await fetch(
            `https://data.cityofchicago.org/resource/85ca-t3if.json?$select=count(*) as total&$where=${encodeURIComponent(filter)}`
        ).then(response => response.json())
            .then(data => {
                setTotal(Number(data[0].total))
            })
            .catch(error => {
                console.error('Error fetching Total:', error);
            });
    }, [filter])


    useEffect(() => {
        fetchTotalCount();
        fetchTableData();
    }, [fetchTotalCount, fetchTableData, paginationModel, filter])

    return (
        <Box sx={{ height: 600 }}>
            <DataGrid
                pagination
                rows={rows}
                getRowId={(row) => row.crash_record_id}
                rowCount={total}
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
