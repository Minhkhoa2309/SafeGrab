// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
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
    dates: Date[]
    setDates?: (value: Date[]) => void
}


interface PickerRangeProps {
    endDate: DateType
    startDate: DateType
    handleChange: (dates: any) => void
}


const PickersRange = (pickerRangeProps: PickerRangeProps) => {

    const { startDate, endDate, handleChange } = pickerRangeProps
    const [dates, setDates] = useState<Date[]>([])

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = props.start !== null ? format(props.start, 'dd/MM/yyyy') : ''
        const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

        const value = `${startDate}${endDate !== null ? endDate : ''}`
        props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
        const updatedProps = { ...props }
        delete updatedProps.setDates

        return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
    })

    const handleOnChangeRange = (dates: any) => {
        const [start, end] = dates
        if (start !== null && end !== null) {
            setDates(dates)
        }
        handleChange(dates)
    }

    return (
        <DatePicker
            selectsRange
            showMonthDropdown
            showYearDropdown
            endDate={endDate}
            selected={startDate}
            startDate={startDate}
            id='date-range-picker'
            onChange={handleOnChangeRange}
            showFullMonthYearPicker
            shouldCloseOnSelect={false}
            customInput={
                <CustomInput label='Date Range' dates={dates} setDates={setDates} start={startDate as Date | number} end={endDate as Date | number} />
            }
        />
    )
}

export default PickersRange
