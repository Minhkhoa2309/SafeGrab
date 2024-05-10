import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

export const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

export const Img = styled('img')(({ theme }) => ({
  marginTop: theme.spacing(10),
  marginBottom: theme.spacing(10),
  width: 350,
  [theme.breakpoints.down('lg')]: {
    height: 150,
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    width: 350,
    height: 200
  }
}))
