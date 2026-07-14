import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { emergencyService } from "@/features/emergency/services/emergency.service"
import type {
  EmergencyAlert,
  EmergencyInput,
  EmergencyListQuery,
  EmergencyListResponse,
} from "@/features/emergency/types/emergency.types"
interface CreatePayload {
  input: EmergencyInput
  resident: { id: string; name: string; tower: string; flatNumber: string }
}
interface RespondPayload {
  id: string
  responder: string
}
export interface EmergencyState {
  items: EmergencyAlert[]
  pagination: Omit<EmergencyListResponse, "items">
  loading: boolean
  mutating: boolean
  error: string | null
}
const initialState: EmergencyState = {
  items: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  mutating: false,
  error: null,
}
const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback
export const fetchEmergencyAlerts = createAsyncThunk(
  "emergency/list",
  async (query: EmergencyListQuery, { rejectWithValue }) => {
    try {
      return await emergencyService.list(query)
    } catch (error) {
      return rejectWithValue(
        message(error, "Emergency alerts could not be loaded")
      )
    }
  }
)
export const createEmergencyAlert = createAsyncThunk(
  "emergency/create",
  async (payload: CreatePayload, { rejectWithValue }) => {
    try {
      return await emergencyService.create(payload.input, payload.resident)
    } catch (error) {
      return rejectWithValue(
        message(error, "Emergency alert could not be sent")
      )
    }
  }
)
export const respondToEmergency = createAsyncThunk(
  "emergency/respond",
  async (payload: RespondPayload, { rejectWithValue }) => {
    try {
      return await emergencyService.respond(payload.id, payload.responder)
    } catch (error) {
      return rejectWithValue(
        message(error, "Emergency could not be acknowledged")
      )
    }
  }
)
export const closeEmergency = createAsyncThunk(
  "emergency/close",
  async (id: string, { rejectWithValue }) => {
    try {
      return await emergencyService.close(id)
    } catch (error) {
      return rejectWithValue(message(error, "Emergency could not be closed"))
    }
  }
)
const fulfilled = [
  createEmergencyAlert.fulfilled.type,
  respondToEmergency.fulfilled.type,
  closeEmergency.fulfilled.type,
]
const pending = [
  createEmergencyAlert.pending.type,
  respondToEmergency.pending.type,
  closeEmergency.pending.type,
]
const rejected = [
  createEmergencyAlert.rejected.type,
  respondToEmergency.rejected.type,
  closeEmergency.rejected.type,
]
const slice = createSlice({
  name: "emergency",
  initialState,
  reducers: {
    clearEmergencyError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyAlerts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmergencyAlerts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchEmergencyAlerts.rejected, (state, action) => {
        state.loading = false
        state.error = String(
          action.payload ?? "Unable to load emergency alerts"
        )
      })
      .addMatcher(
        (action) => pending.includes(action.type),
        (state) => {
          state.mutating = true
          state.error = null
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: EmergencyAlert } =>
          fulfilled.includes(action.type),
        (state, action) => {
          state.mutating = false
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          )
          if (index >= 0) state.items[index] = action.payload
          else state.items.unshift(action.payload)
        }
      )
      .addMatcher(
        (action) => rejected.includes(action.type),
        (state, action) => {
          state.mutating = false
          state.error = String(
            (action as { payload?: unknown }).payload ??
              "Emergency action failed"
          )
        }
      )
  },
})
export const { clearEmergencyError } = slice.actions
export const emergencyReducer = slice.reducer
