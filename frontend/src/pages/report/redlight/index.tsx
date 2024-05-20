import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Autocomplete, Card, CardContent, CardHeader, FormControl, Grid, TextField, Typography } from '@mui/material';
import RedlightTable from 'src/views/report/redlight/RedlightTable';
import RedlightMap from 'src/views/report/redlight/RedlightMap';
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import PickersRange from 'src/layouts/components/pickers/PickerRange';
import { DateType } from 'src/types/DatepickerTypes';
import { IntersectionOptionType } from 'src/types/IntersectionOptionType';
import DatePickerWrapper from 'src/@core/styles/libs/react-date-picker';
import { fetchIntersection } from 'src/store/redlights';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';


const RedlightReport = () => {
    const [tab, setTab] = useState<string>('1')
    const [startDate, setStartDate] = useState<DateType>(new Date('07/01/2014'))
    const [endDate, setEndDate] = useState<DateType>(new Date())
    const [intersection, setIntersection] = useState<IntersectionOptionType | null>(null)
    const [intersectionOptions, setIntersectionOptions] = useState<IntersectionOptionType[]>([])

    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const getOptions = async () => {
            await dispatch(fetchIntersection())
                .then((response) => {
                    if (response.payload) {
                        setIntersectionOptions(response.payload);
                    }
                }).catch(error => {
                    console.error('Error fetching Map:', error);
                });
        }
        getOptions();
    }, [dispatch])

    const handleChangeIntersection = (event: SyntheticEvent, newIntersection: IntersectionOptionType | null) => {
        setIntersection(newIntersection)
    }

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
                            Redlight Camera Violations
                        </Typography>
                    }
                    subtitle={
                        <Typography variant='body2'>
                            Reflects the daily number of red light camera violations recorded by the City of Chicago Red Light Program for each camera since 2014.
                        </Typography>
                    }

                />
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='Search Filters' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }} />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            fullWidth
                                            value={intersection}
                                            options={intersectionOptions}
                                            onChange={handleChangeIntersection}
                                            id='autocomplete-controlled'
                                            getOptionLabel={option => option.intersection || ''}
                                            renderInput={params => <TextField {...params} label='Intersection' />}
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
                            <TabList onChange={handleChangeTab}>
                                <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                                <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                            </TabList>
                            <TabPanel value='1'>
                                <Grid item xs={12} sm={12}>
                                    <RedlightTable startDate={startDate} endDate={endDate} intersection={intersection?.intersection} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value='2'>
                                <Grid item xs={12} sm={12}>
                                    <RedlightMap startDate={startDate} endDate={endDate} intersection={intersection?.intersection} />
                                </Grid>
                            </TabPanel>
                        </TabContext>
                    </Card>
                </Grid>
            </Grid>
        </DatePickerWrapper>
    )
};

export default RedlightReport;
