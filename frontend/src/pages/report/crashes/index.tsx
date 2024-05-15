import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Autocomplete, Box, Card, CardContent, CardHeader, Grid, TextField, Typography } from '@mui/material';
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
import { format } from 'date-fns';
import { DateType } from 'src/types/DatepickerTypes';
import { StreetOptionType } from 'src/types/StreetOptionType';

const CrashReport = () => {
    // ** States
    const [tab, setTab] = useState<string>('1');
    const [startDate, setStartDate] = useState<DateType>(new Date('03/03/2013'))
    const [endDate, setEndDate] = useState<DateType>(new Date())
    const [street, setStreet] = useState<StreetOptionType | null>(null)
    const [streetOptions, setStreetOptions] = useState<StreetOptionType[]>([])
    const [filterString, setFilterString] = useState<string>('');

    useEffect(() => {
        const getOptions = async () => {
            await fetch(
                `https://data.cityofchicago.org/api/id/85ca-t3if.json?$query=SELECT%20%60street_name%60%2C%20count(%60street_name%60)%20as%20%60__count_alias__%60 %20GROUP%20BY%20%60street_name%60%20ORDER%20BY%20%60__count_alias__%60%20desc&$$read_from_nbe=true&$$version=2.1`
            ).then(response => response.json())
                .then((data: StreetOptionType[]) => {
                    setStreetOptions(data);
                })
                .catch(error => {
                    console.error('Error fetching Total:', error);
                });
        }
        getOptions();
    }, [])

    useEffect(() => {
        const formatFilterString = () => {
            if (!startDate || !endDate) {
                return;
            }
            const formattedStartDate = format(startDate as Date | number, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate as Date | number, 'yyyy-MM-dd');
            let filter = `crash_date >= '${formattedStartDate}' AND crash_date < '${formattedEndDate}'`;

            if (street && street.street_name) {
                filter += ` AND (street_name = '${street.street_name}')`;
            }

            setFilterString(filter);
        }

        formatFilterString();
    }, [startDate, endDate, street]);

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
                <PageHeader
                    subtitle={<Typography variant='body2'>Shows each crash that occured within city streets as reported in the electronic crash reporting system (E-Crash) at CPD</Typography>}
                    title={
                        <Typography variant='h5'>
                            Traffic Crashes Report
                        </Typography>
                    }
                />
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title={'Filter'} />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <Box className='demo-space-x' sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                        <Autocomplete
                                            fullWidth
                                            value={street}
                                            options={streetOptions}
                                            onChange={handleChangeStreet}
                                            id='autocomplete-controlled'
                                            getOptionLabel={option => option.street_name || ''}
                                            renderInput={params => <TextField {...params} label='Street Name' />}
                                        />
                                    </Box>
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
                            <TabList onChange={handleChange} centered>
                                <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                                <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                            </TabList>
                            <TabPanel value='1'>
                                <Grid item xs={12} sm={12}>
                                    <CrashTable filter={filterString} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value='2'>
                                <Grid item xs={12} sm={12}>
                                    <CrashMap filter={filterString} />
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
