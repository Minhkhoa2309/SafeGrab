// ** React Imports
import { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Types
import { DateType } from 'src/types/DatepickerTypes'

interface PickerProps {
    label?: string
    end: Date | number
    start: Date | number
}


interface PickerRangeProps {
    endDate: DateType
    startDate: DateType
    handleChange: (dates: any) => void
}


const PickersRange = (pickerRangeProps: PickerRangeProps) => {

    const { startDate, endDate, handleChange } = pickerRangeProps

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = format(props.start, 'dd/MM/yyyy')
        const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

        const value = `${startDate}${endDate !== null ? endDate : ''}`

        return <TextField fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
    })

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }} className='demo-space-x'>
            <div>
                <DatePicker
                    selectsRange
                    endDate={endDate}
                    selected={startDate}
                    startDate={startDate}
                    id='date-range-picker'
                    onChange={handleChange}
                    showYearDropdown
                    showMonthDropdown
                    shouldCloseOnSelect={false}
                    customInput={
                        <CustomInput label='Date Range' start={startDate as Date | number} end={endDate as Date | number} />
                    }
                />
            </div>
        </Box>
    )
}

export default PickersRange
