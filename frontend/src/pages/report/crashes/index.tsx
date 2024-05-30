import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Autocomplete, Card, CardContent, CardHeader, FormControl, Grid, TextField, Typography } from '@mui/material';
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import CrashTable from 'src/views/report/crash/CrashTable';
import CrashMap from 'src/views/report/crash/CrashMap';
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import PickersRange from 'src/layouts/components/pickers/PickerRange';
import DatePickerWrapper from 'src/@core/styles/libs/react-date-picker';
import { DateType } from 'src/types/DatepickerTypes';
import { StreetOptionType } from 'src/types/StreetOptionType';
import { AppDispatch } from 'src/store';
import { useDispatch } from 'react-redux';
import { fetchStreetNames } from 'src/store/crashes';

const CrashReport = () => {
    // ** States
    const [tab, setTab] = useState<string>('1');
    const [startDate, setStartDate] = useState<DateType>(new Date('03/03/2013'))
    const [endDate, setEndDate] = useState<DateType>(new Date())
    const [street, setStreet] = useState<StreetOptionType | null>(null)
    const [streetOptions, setStreetOptions] = useState<StreetOptionType[]>([])

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const getOptions = async () => {
            await dispatch(fetchStreetNames())
                .then((response) => {
                    if (response.payload) {
                        setStreetOptions(response.payload);
                    }
                }).catch(error => {
                    console.error('Error fetching Map:', error);
                });
        }
        getOptions();
    }, [dispatch])

    const handleChangeStreet = (event: SyntheticEvent, newStreet: StreetOptionType | null) => {
        setStreet(newStreet)
    }

    const handleChangeDate = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const handleChange = (event: SyntheticEvent, newTab: string) => {
        setTab(newTab)
    }

    return (
        <DatePickerWrapper >
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <PageHeader
                        title={
                            <Typography variant='h5'>
                                Traffic Crashes Report
                            </Typography>
                        }
                        subtitle={
                            <Typography variant='body2'>
                                Shows each crash that occured within city streets as reported in the electronic crash reporting system (E-Crash) at CPD
                            </Typography>
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='Search Filters' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            fullWidth
                                            value={street}
                                            options={streetOptions}
                                            onChange={handleChangeStreet}
                                            id='autocomplete-controlled'
                                            getOptionLabel={option => option.street_name || ''}
                                            renderInput={params => <TextField {...params} label='Street Name' />}
                                        />
                                    </FormControl>
                                </Grid>
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
                            <TabList onChange={handleChange}>
                                <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                                <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                            </TabList>
                            <TabPanel value='1'>
                                <Grid item xs={12} sm={12}>
                                    <CrashTable startDate={startDate} endDate={endDate} streetName={street?.street_name} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value='2'>
                                <Grid item xs={12} sm={12}>
                                    <CrashMap startDate={startDate} endDate={endDate} streetName={street?.street_name} />
                                </Grid>
                            </TabPanel>
                        </TabContext>
                    </Card>
                </Grid>
            </Grid>
        </DatePickerWrapper>
    )
};

export default CrashReport;
