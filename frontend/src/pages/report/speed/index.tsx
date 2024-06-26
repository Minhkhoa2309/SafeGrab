import React, { SyntheticEvent, useState } from 'react';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import SpeedTable from 'src/views/report/speed/SpeedTable';
import SpeedMap from 'src/views/report/speed/SpeedMap';
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import { DateType } from 'src/types/DatepickerTypes';
import PickersRange from 'src/layouts/components/pickers/PickerRange';
import DatePickerWrapper from 'src/@core/styles/libs/react-date-picker';

const SpeedReport = () => {
    // ** States
    const [tab, setTab] = useState<string>('1');
    const [startDate, setStartDate] = useState<DateType>(new Date('07/01/2014'))
    const [endDate, setEndDate] = useState<DateType>(new Date())

    const handleChangeDate = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const handleChangeTab = (event: SyntheticEvent, newTab: string) => {
        setTab(newTab)
    }

    return (
        <DatePickerWrapper >
            <Grid container spacing={6}>
                <PageHeader
                    title={
                        <Typography variant='h5'>
                            Speed Camera Violations Report
                        </Typography>
                    }
                    subtitle={
                        <Typography variant='body2'>
                            Reflects the daily number of speed camera violations recorded by each camera in Children's Safety Zones since 2014.
                        </Typography>
                    }
                />
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='Search Filters' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <PickersRange startDate={startDate} endDate={endDate} handleChange={handleChangeDate} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <TabContext value={tab}>
                            <TabList onChange={handleChangeTab}>
                                <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                                <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                            </TabList>
                            <TabPanel value='1'>
                                <Grid item xs={12} sm={12}>
                                    <SpeedTable startDate={startDate} endDate={endDate} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value='2'>
                                <Grid item xs={12} sm={12}>
                                    <SpeedMap startDate={startDate} endDate={endDate} />
                                </Grid>
                            </TabPanel>
                        </TabContext>
                    </Card>
                </Grid>
            </Grid>
        </DatePickerWrapper>
    )
};

export default SpeedReport;
