// ** React Imports
import { ReactNode } from 'react'

// ** Type Imports
import { ThemeColor } from 'src/@core/layouts/types'

// ** Types of Basic Custom Checkboxes
export type CustomCheckboxBasicData = {
  value: string
  content?: ReactNode
  isSelected?: boolean
} & (
  | {
      meta: ReactNode
      title: ReactNode
    }
  | {
      meta?: never
      title?: never
    }
  | {
      title: ReactNode
      meta?: never
    }
)
export type CustomCheckboxBasicProps = {
  title: string
  color: ThemeColor
  selected: boolean
  handleChange: () => void
}
