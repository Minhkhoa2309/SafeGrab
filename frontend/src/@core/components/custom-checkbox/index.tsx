// ** MUI Imports
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

// ** Type Imports
import { CustomCheckboxBasicProps } from 'src/@core/components/custom-checkbox/types'

const CustomCheckbox = (props: CustomCheckboxBasicProps) => {
    // ** Props
    const { title, selected, handleChange, color } = props

    return (
        <Box
            onClick={handleChange}
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative',
                alignItems: 'flex-start',
                border: theme => `2px solid ${theme.palette.divider}`,
                ...(selected
                    ? { borderColor: `${color}.main` }
                    : { '&:hover': { borderColor: theme => `rgba(${theme.palette.customColors.main}, 0.25)` } })
            }}
        >
            <Checkbox
                size='small'
                color={color}
                name={`Speed Layer`}
                checked={selected}
                onChange={handleChange}
                sx={{ mb: -2, mt: -1.75, ml: -1.75 }}
            />
            <Typography sx={{ mr: 2, fontWeight: 500 }}>{title}</Typography>
        </Box>
    )
}

export default CustomCheckbox
