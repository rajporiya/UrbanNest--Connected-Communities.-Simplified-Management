import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { reportService } from "@/features/reports/services/report.service"
import type {
  ReportQuery,
  ReportSnapshot,
} from "@/features/reports/types/report.types"

interface ReportsState {
  data: ReportSnapshot | null
  query: ReportQuery
  loading: boolean
  error: string | null
}

const initialState: ReportsState = {
  data: null,
  query: { category: "users" },
  loading: false,
  error: null,
}

export const fetchReport = createAsyncThunk<
  ReportSnapshot,
  ReportQuery,
  { rejectValue: string }
>("reports/fetch", async (query, { rejectWithValue }) => {
  try {
    return await reportService.getReport(query)
  } catch {
    return rejectWithValue("The report could not be loaded.")
  }
})

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchReport.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.query = action.meta.arg
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "The report could not be loaded."
      }),
})

export const reportsReducer = reportsSlice.reducer
