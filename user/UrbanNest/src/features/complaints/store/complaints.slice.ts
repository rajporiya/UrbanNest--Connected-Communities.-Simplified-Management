import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { complaintService } from "@/features/complaints/services/complaint.service"
import type {
  Complaint,
  ComplaintInput,
  ComplaintListQuery,
  ComplaintListResponse,
  ComplaintStatus,
} from "@/features/complaints/types/complaint.types"
interface CreatePayload {
  input: ComplaintInput
  resident: { id: string; name: string; tower: string; flatNumber: string }
}
interface AssignPayload {
  id: string
  assigneeId: string
  note: string
}
interface StatusPayload {
  id: string
  status: ComplaintStatus
  note: string
  actor?: string
}
export interface ComplaintsState {
  items: Complaint[]
  selected: Complaint | null
  pagination: Omit<ComplaintListResponse, "items">
  loading: boolean
  mutating: boolean
  error: string | null
}
const initialState: ComplaintsState = {
  items: [],
  selected: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  mutating: false,
  error: null,
}
const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback
export const fetchComplaints = createAsyncThunk(
  "complaints/list",
  async (query: ComplaintListQuery, { rejectWithValue }) => {
    try {
      return await complaintService.list(query)
    } catch (error) {
      return rejectWithValue(message(error, "Complaints could not be loaded"))
    }
  }
)
export const fetchComplaintDetails = createAsyncThunk(
  "complaints/details",
  async (id: string, { rejectWithValue }) => {
    try {
      return await complaintService.details(id)
    } catch (error) {
      return rejectWithValue(message(error, "Complaint could not be loaded"))
    }
  }
)
export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (payload: CreatePayload, { rejectWithValue }) => {
    try {
      return await complaintService.create(payload.input, payload.resident)
    } catch (error) {
      return rejectWithValue(message(error, "Complaint could not be created"))
    }
  }
)
export const assignComplaint = createAsyncThunk(
  "complaints/assign",
  async (payload: AssignPayload, { rejectWithValue }) => {
    try {
      return await complaintService.assign(
        payload.id,
        payload.assigneeId,
        payload.note
      )
    } catch (error) {
      return rejectWithValue(message(error, "Complaint could not be assigned"))
    }
  }
)
export const updateComplaintStatus = createAsyncThunk(
  "complaints/status",
  async (payload: StatusPayload, { rejectWithValue }) => {
    try {
      return await complaintService.updateStatus(
        payload.id,
        payload.status,
        payload.note,
        payload.actor
      )
    } catch (error) {
      return rejectWithValue(message(error, "Status could not be updated"))
    }
  }
)
const fulfilled = [
  createComplaint.fulfilled.type,
  assignComplaint.fulfilled.type,
  updateComplaintStatus.fulfilled.type,
]
const pending = [
  createComplaint.pending.type,
  assignComplaint.pending.type,
  updateComplaintStatus.pending.type,
]
const rejected = [
  createComplaint.rejected.type,
  assignComplaint.rejected.type,
  updateComplaintStatus.rejected.type,
]
const slice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    clearComplaintSelection: (state) => {
      state.selected = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load complaints")
      })
      .addCase(fetchComplaintDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplaintDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchComplaintDetails.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load complaint")
      })
      .addMatcher(
        (action) => pending.includes(action.type),
        (state) => {
          state.mutating = true
          state.error = null
        }
      )
      .addMatcher(
        (action): action is { type: string; payload: Complaint } =>
          fulfilled.includes(action.type),
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
        (action) => rejected.includes(action.type),
        (state, action) => {
          state.mutating = false
          state.error = String(
            (action as { payload?: unknown }).payload ??
              "Complaint action failed"
          )
        }
      )
  },
})
export const { clearComplaintSelection } = slice.actions
export const complaintsReducer = slice.reducer
