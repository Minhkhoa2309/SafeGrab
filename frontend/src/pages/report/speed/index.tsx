import React, { SyntheticEvent, useState } from 'react';
import { Card, Grid } from '@mui/material';
import SpeedTable from 'src/views/report/speed/SpeedTable';
import SpeedMap from 'src/views/report/speed/SpeedMap';
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Icon from 'src/@core/components/icon';


const SpeedReport = () => {
    const [tab, setTab] = useState<string>('1')

    const handleChange = (event: SyntheticEvent, newTab: string) => {
        setTab(newTab)
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <TabContext value={tab}>
                        <TabList onChange={handleChange}>
                            <Tab value='1' label='Table' icon={<Icon icon='mdi:table' />} />
                            <Tab value='2' label='Map' icon={<Icon icon='mdi:world' />} />
                        </TabList>
                        <TabPanel value='1'>
                            <Grid item xs={12} sm={12}>
                                <SpeedTable />
                            </Grid>
                        </TabPanel>
                        <TabPanel value='2'>
                            <Grid item xs={12} sm={12}>
                                <SpeedMap />
                            </Grid>
                        </TabPanel>
                    </TabContext>
                </Card>
            </Grid>
        </Grid>
    )
};

export default SpeedReport;
