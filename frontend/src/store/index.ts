// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'
import crashes from './crashes'
import speeds from './speeds'
import redlights from './redlights'


export const store = configureStore({
  reducer: {
    crashes,
    speeds,
    redlights
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

