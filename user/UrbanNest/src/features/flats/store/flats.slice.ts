import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { flatService } from "@/features/flats/services/flat.service"
import type {
  CreateFlatRequest,
  FlatDetails,
  FlatListItem,
  FlatListQuery,
  FlatListResponse,
  UpdateFlatRequest,
} from "@/features/flats/types/flat.types"

export type FlatMutation = "create" | "update" | "delete"

export interface FlatsState {
  flats: FlatListItem[]
  selectedFlat: FlatDetails | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: FlatListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  activeMutation: FlatMutation | null
  error: string | null
  activeListRequestId: string | null
  activeListQueryKey: string | null
  activeDetailsRequestId: string | null
  activeDetailsFlatId: string | null
}

interface FlatsRootState {
  flats: FlatsState
}

interface FlatThunkConfig {
  state: FlatsRootState
  rejectValue: string
}

export interface UpdateFlatPayload {
  id: string
  data: UpdateFlatRequest
}

const initialState: FlatsState = {
  flats: [],
  selectedFlat: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: { page: 1, limit: 10 },
  listLoading: false,
  detailsLoading: false,
  mutationLoading: false,
  activeMutation: null,
  error: null,
  activeListRequestId: null,
  activeListQueryKey: null,
  activeDetailsRequestId: null,
  activeDetailsFlatId: null,
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback

const getQueryKey = (query: FlatListQuery) =>
  JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    search: query.search ?? "",
    towerId: query.towerId ?? "",
    floorNumber: query.floorNumber ?? "",
    bhkType: query.bhkType ?? "",
    occupancyStatus: query.occupancyStatus ?? "",
    sort: query.sort ?? "",
  })

const canStartMutation = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as FlatsRootState).flats.mutationLoading

export const fetchFlats = createAsyncThunk<FlatListResponse, FlatListQuery, FlatThunkConfig>(
  "flats/fetchFlats",
  async (query, { rejectWithValue }) => {
    try {
      return await flatService.getFlats(query)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Flats could not be loaded."))
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState().flats
      return !(state.listLoading && state.activeListQueryKey === getQueryKey(query))
    },
  },
)

export const fetchFlatDetails = createAsyncThunk<FlatDetails, string, FlatThunkConfig>(
  "flats/fetchFlatDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await flatService.getFlatById(id)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Flat details could not be loaded."))
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().flats
      return !(state.detailsLoading && state.activeDetailsFlatId === id)
    },
  },
)

export const createFlat = createAsyncThunk<FlatDetails, CreateFlatRequest, FlatThunkConfig>(
  "flats/createFlat",
  async (data, { rejectWithValue }) => {
    try {
      return await flatService.createFlat(data)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "The flat could not be created."))
    }
  },
  { condition: canStartMutation },
)

export const updateFlat = createAsyncThunk<FlatDetails, UpdateFlatPayload, FlatThunkConfig>(
  "flats/updateFlat",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await flatService.updateFlat(id, data)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "The flat could not be updated."))
    }
  },
  { condition: canStartMutation },
)

export const deleteFlat = createAsyncThunk<string, string, FlatThunkConfig>(
  "flats/deleteFlat",
  async (id, { rejectWithValue }) => {
    try {
      await flatService.deleteFlat(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "The flat could not be deleted."))
    }
  },
  { condition: canStartMutation },
)

const flatsSlice = createSlice({
  name: "flats",
  initialState,
  reducers: {
    clearSelectedFlat: (state) => {
      state.selectedFlat = null
      state.detailsLoading = false
      state.activeDetailsRequestId = null
      state.activeDetailsFlatId = null
    },
    clearFlatsError: (state) => {
      state.error = null
    },
    setFlatFilters: (state, action: PayloadAction<FlatListQuery>) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlats.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.filters = action.meta.arg
        state.activeListRequestId = action.meta.requestId
        state.activeListQueryKey = getQueryKey(action.meta.arg)
      })
      .addCase(fetchFlats.fulfilled, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return
        state.listLoading = false
        state.flats = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.activeListRequestId = null
        state.activeListQueryKey = null
      })
      .addCase(fetchFlats.rejected, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return
        state.listLoading = false
        state.activeListRequestId = null
        state.activeListQueryKey = null
        if (!action.meta.condition) state.error = action.payload ?? "Flats could not be loaded."
      })
      .addCase(fetchFlatDetails.pending, (state, action) => {
        state.detailsLoading = true
        state.error = null
        state.activeDetailsRequestId = action.meta.requestId
        state.activeDetailsFlatId = action.meta.arg
        if (state.selectedFlat?.id !== action.meta.arg) state.selectedFlat = null
      })
      .addCase(fetchFlatDetails.fulfilled, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return
        state.detailsLoading = false
        state.selectedFlat = action.payload
        state.activeDetailsRequestId = null
        state.activeDetailsFlatId = null
        const index = state.flats.findIndex((flat) => flat.id === action.payload.id)
        if (index >= 0) state.flats[index] = action.payload
      })
      .addCase(fetchFlatDetails.rejected, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return
        state.detailsLoading = false
        state.activeDetailsRequestId = null
        state.activeDetailsFlatId = null
        if (!action.meta.condition) state.error = action.payload ?? "Flat details could not be loaded."
      })
      .addCase(createFlat.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "create"
        state.error = null
      })
      .addCase(createFlat.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.activeMutation = null
        state.selectedFlat = action.payload
        state.flats.unshift(action.payload)
        state.pagination.total += 1
        state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit))
      })
      .addCase(updateFlat.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "update"
        state.error = null
      })
      .addCase(updateFlat.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.activeMutation = null
        state.selectedFlat = action.payload
        const index = state.flats.findIndex((flat) => flat.id === action.payload.id)
        if (index >= 0) state.flats[index] = action.payload
      })
      .addCase(deleteFlat.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "delete"
        state.error = null
      })
      .addCase(deleteFlat.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.activeMutation = null
        const index = state.flats.findIndex((flat) => flat.id === action.payload)
        if (index >= 0) {
          state.flats.splice(index, 1)
          state.pagination.total = Math.max(0, state.pagination.total - 1)
          state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit))
        }
        if (state.selectedFlat?.id === action.payload) state.selectedFlat = null
      })
      .addMatcher(
        (action) =>
          createFlat.rejected.match(action) ||
          updateFlat.rejected.match(action) ||
          deleteFlat.rejected.match(action),
        (state, action) => {
          if (action.meta.condition) return
          state.mutationLoading = false
          state.activeMutation = null
          state.error = action.payload ?? "The flat could not be updated."
        },
      )
  },
})

export const { clearSelectedFlat, clearFlatsError, setFlatFilters } = flatsSlice.actions
export const flatsReducer = flatsSlice.reducer
export default flatsSlice.reducer
