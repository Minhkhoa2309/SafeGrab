import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Autocomplete, Box, Card, CardContent, CardHeader, Grid, TextField, Typography } from '@mui/material';
import RedlightTable from 'src/views/report/redlight/RedlightTable';
import RedlightMap from 'src/views/report/redlight/RedlightMap';
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import PickersRange from 'src/layouts/components/pickers/PickerRange';
import { format } from 'date-fns';
import { DateType } from 'src/types/DatepickerTypes';
import { IntersectionOptionType } from 'src/types/IntersectionOptionType';
import DatePickerWrapper from 'src/@core/styles/libs/react-date-picker';


const RedlightReport = () => {
    const [tab, setTab] = useState<string>('1')
    const [startDate, setStartDate] = useState<DateType>(new Date('07/01/2014'))
    const [endDate, setEndDate] = useState<DateType>(new Date())
    const [intersection, setIntersection] = useState<IntersectionOptionType | null>(null)
    const [intersectionOptions, setIntersectionOptions] = useState<IntersectionOptionType[]>([])
    const [filterString, setFilterString] = useState<string>('');

    useEffect(() => {
        const getOptions = async () => {
            await fetch(
                `https://data.cityofchicago.org/api/id/spqx-js37.json?$query=SELECT%20%60intersection%60%2C%20count(%60intersection%60)%20as%20%60__count_alias__%60 %20GROUP%20BY%20%60intersection%60%20ORDER%20BY%20%60__count_alias__%60%20desc&$$read_from_nbe=true&$$version=2.1`
            ).then(response => response.json())
                .then((data: IntersectionOptionType[]) => {
                    setIntersectionOptions(data);
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
            let filter = `violation_date >= '${formattedStartDate}' AND violation_date < '${formattedEndDate}'`;

            if (intersection && intersection.intersection) {
                filter += ` AND (intersection = '${intersection.intersection}')`;
            }

            setFilterString(filter);
        }

        formatFilterString();
    }, [startDate, endDate, intersection]);

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
                    subtitle={<Typography variant='body2'>Reflects the daily number of red light camera violations recorded by the City of Chicago Red Light Program for each camera since 2014.</Typography>}
                    title={
                        <Typography variant='h5'>
                            Redlight Camera Violations
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
                                            value={intersection}
                                            options={intersectionOptions}
                                            onChange={handleChangeIntersection}
                                            id='autocomplete-controlled'
                                            getOptionLabel={option => option.intersection || ''}
                                            renderInput={params => <TextField {...params} label='Intersection' />}
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
                            <TabList onChange={handleChangeTab} centered>
                                <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                                <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                            </TabList>
                            <TabPanel value='1'>
                                <Grid item xs={12} sm={12}>
                                    <RedlightTable filter={filterString} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value='2'>
                                <Grid item xs={12} sm={12}>
                                    <RedlightMap filter={filterString} />
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
