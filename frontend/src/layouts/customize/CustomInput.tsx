import { forwardRef, ChangeEvent } from 'react'
import { DateType } from 'src/types/DatepickerTypes'
import TextField from '@mui/material/TextField'

interface CustomInputProps {
  value: DateType
  label: string
  error?: boolean
  readOnly?: boolean
  onChange?: (event: ChangeEvent) => void
}

const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <TextField inputRef={ref} {...props} sx={{ width: '100%' }} />
})

export default CustomInput
