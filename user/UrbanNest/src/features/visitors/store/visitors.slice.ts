import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { visitorService } from "@/features/visitors/services/visitor.service"
import type {
  VisitorListQuery,
  VisitorListResponse,
  VisitorPass,
  VisitorPassInput,
  VisitorReport,
} from "@/features/visitors/types/visitor.types"

interface CreatePayload {
  input: VisitorPassInput
  resident: { id: string; name: string; tower: string; flatNumber: string }
}
export interface VisitorsState {
  items: VisitorPass[]
  selected: VisitorPass | null
  report: VisitorReport | null
  pagination: Omit<VisitorListResponse, "items">
  loading: boolean
  mutating: boolean
  error: string | null
}
const initialState: VisitorsState = {
  items: [],
  selected: null,
  report: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  mutating: false,
  error: null,
}
const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

export const fetchVisitors = createAsyncThunk(
  "visitors/list",
  async (query: VisitorListQuery, { rejectWithValue }) => {
    try {
      return await visitorService.list(query)
    } catch (error) {
      return rejectWithValue(
        message(error, "Visitor records could not be loaded")
      )
    }
  }
)
export const fetchVisitorDetails = createAsyncThunk(
  "visitors/details",
  async (id: string, { rejectWithValue }) => {
    try {
      return await visitorService.details(id)
    } catch (error) {
      return rejectWithValue(message(error, "Visitor pass could not be loaded"))
    }
  }
)
export const createVisitorPass = createAsyncThunk(
  "visitors/create",
  async (payload: CreatePayload, { rejectWithValue }) => {
    try {
      return await visitorService.create(payload.input, payload.resident)
    } catch (error) {
      return rejectWithValue(
        message(error, "Visitor pass could not be created")
      )
    }
  }
)
export const verifyVisitorPass = createAsyncThunk(
  "visitors/verify",
  async (code: string, { rejectWithValue }) => {
    try {
      return await visitorService.verify(code)
    } catch (error) {
      return rejectWithValue(
        message(error, "Visitor pass could not be verified")
      )
    }
  }
)
export const checkInVisitor = createAsyncThunk(
  "visitors/checkIn",
  async (id: string, { rejectWithValue }) => {
    try {
      return await visitorService.checkIn(id)
    } catch (error) {
      return rejectWithValue(message(error, "Check-in failed"))
    }
  }
)
export const checkOutVisitor = createAsyncThunk(
  "visitors/checkOut",
  async (id: string, { rejectWithValue }) => {
    try {
      return await visitorService.checkOut(id)
    } catch (error) {
      return rejectWithValue(message(error, "Check-out failed"))
    }
  }
)
export const cancelVisitorPass = createAsyncThunk(
  "visitors/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      return await visitorService.cancel(id)
    } catch (error) {
      return rejectWithValue(
        message(error, "Visitor pass could not be cancelled")
      )
    }
  }
)
export const fetchVisitorReport = createAsyncThunk("visitors/report", () =>
  visitorService.report()
)

const slice = createSlice({
  name: "visitors",
  initialState,
  reducers: {
    clearVisitorSelection: (state) => {
      state.selected = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load visitors")
      })
      .addCase(fetchVisitorDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVisitorDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchVisitorDetails.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load visitor")
      })
      .addCase(fetchVisitorReport.fulfilled, (state, action) => {
        state.report = action.payload
      })
      .addMatcher(
        (action) =>
          [
            createVisitorPass.pending.type,
            verifyVisitorPass.pending.type,
            checkInVisitor.pending.type,
            checkOutVisitor.pending.type,
            cancelVisitorPass.pending.type,
          ].includes(action.type),
        (state) => {
          state.mutating = true
          state.error = null
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: VisitorPass } =>
          [
            createVisitorPass.fulfilled.type,
            verifyVisitorPass.fulfilled.type,
            checkInVisitor.fulfilled.type,
            checkOutVisitor.fulfilled.type,
            cancelVisitorPass.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.mutating = false
          state.selected = action.payload
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          )
          if (index >= 0) state.items[index] = action.payload
          else state.items.unshift(action.payload)
        }
      )
      .addMatcher(
        (action) =>
          [
            createVisitorPass.rejected.type,
            verifyVisitorPass.rejected.type,
            checkInVisitor.rejected.type,
            checkOutVisitor.rejected.type,
            cancelVisitorPass.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.mutating = false
          const rejected = action as { payload?: unknown }
          state.error = String(rejected.payload ?? "Visitor action failed")
        }
      )
  },
})
export const { clearVisitorSelection } = slice.actions
export const visitorsReducer = slice.reducer
