import { createSlice } from '@reduxjs/toolkit'

interface SliceState{
    status:{[index: string]: boolean}
}

const initialState: SliceState = {
    status:{}
}

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    open: (state, action) => {
      state.status[action.payload] = true
    },
    close: (state, action) => {
      state.status[action.payload] = false
    },
  },
})

export const { open, close } = connectionSlice.actions

export default connectionSlice.reducer