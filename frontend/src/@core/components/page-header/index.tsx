// ** MUI Imports
import Grid from '@mui/material/Grid'
import { ReactNode } from 'react'

// ** Types
type PageHeaderProps = {
    title: ReactNode
    subtitle?: ReactNode
}

const PageHeader = (props: PageHeaderProps) => {
    // ** Props
    const { title, subtitle } = props

    return (
        <Grid item xs={12}>
            {title}
            {subtitle || null}
        </Grid>
    )
}

export default PageHeader
