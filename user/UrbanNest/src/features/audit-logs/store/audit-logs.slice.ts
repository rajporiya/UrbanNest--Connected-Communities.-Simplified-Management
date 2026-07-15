import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { auditLogService } from "@/features/audit-logs/services/audit-log.service"
import type {
  AuditLog,
  AuditLogQuery,
  AuditLogResponse,
} from "@/features/audit-logs/types/audit-log.types"

interface AuditLogsState {
  items: AuditLog[]
  query: AuditLogQuery
  page: number
  limit: number
  total: number
  totalPages: number
  loading: boolean
  error: string | null
}
const initialState: AuditLogsState = {
  items: [],
  query: { page: 1, limit: 10 },
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,
}
export const fetchAuditLogs = createAsyncThunk<
  AuditLogResponse,
  AuditLogQuery,
  { rejectValue: string }
>("auditLogs/fetch", async (query, { rejectWithValue }) => {
  try {
    return await auditLogService.getLogs(query)
  } catch {
    return rejectWithValue("Audit activity could not be loaded.")
  }
})
const slice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchAuditLogs.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.query = action.meta.arg
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        Object.assign(state, action.payload)
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Audit activity could not be loaded."
      }),
})
export const auditLogsReducer = slice.reducer
