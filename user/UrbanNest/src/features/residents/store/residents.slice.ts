import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type Draft,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { residentService } from "@/features/residents/services/resident.service"
import type {
  CreateResidentRequest,
  ResidentDetails,
  ResidentListItem,
  ResidentListQuery,
  ResidentListResponse,
  UpdateResidentRequest,
} from "@/features/residents/types/resident.types"

export type ResidentMutation =
  | "create"
  | "update"
  | "approve"
  | "reject"
  | "activate"
  | "deactivate"
  | "block"
  | "unblock"

export interface ResidentPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ResidentsState {
  residents: ResidentListItem[]
  selectedResident: ResidentDetails | null
  pagination: ResidentPaginationState
  filters: ResidentListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  activeMutation: ResidentMutation | null
  error: string | null
  activeListRequestId: string | null
  activeListQueryKey: string | null
  activeDetailsRequestId: string | null
  activeDetailsResidentId: string | null
}

interface ResidentsRootState {
  residents: ResidentsState
}

interface UpdateResidentPayload {
  id: string
  data: UpdateResidentRequest
}

interface ResidentThunkConfig {
  state: ResidentsRootState
  rejectValue: string
}

const DEFAULT_PAGE_SIZE = 10

const initialState: ResidentsState = {
  residents: [],
  selectedResident: null,
  pagination: {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  },
  listLoading: false,
  detailsLoading: false,
  mutationLoading: false,
  activeMutation: null,
  error: null,
  activeListRequestId: null,
  activeListQueryKey: null,
  activeDetailsRequestId: null,
  activeDetailsResidentId: null,
}

const getSafeErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.name === "AbortError") {
    return "The resident request was cancelled."
  }

  return "We could not complete the resident request. Please try again."
}

const getQueryKey = (query: ResidentListQuery) =>
  JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_PAGE_SIZE,
    search: query.search ?? "",
    approvalStatus: query.approvalStatus ?? "",
    accountStatus: query.accountStatus ?? "",
    tower: query.tower ?? "",
    ownershipType: query.ownershipType ?? "",
    sort: query.sort ?? "",
  })

const canStartMutation = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as ResidentsRootState).residents.mutationLoading

export const fetchResidents = createAsyncThunk<
  ResidentListResponse,
  ResidentListQuery,
  ResidentThunkConfig
>(
  "residents/fetchResidents",
  async (query, { rejectWithValue }) => {
    try {
      return await residentService.getResidents(query)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState().residents
      return !(state.listLoading && state.activeListQueryKey === getQueryKey(query))
    },
  },
)

export const fetchResidentDetails = createAsyncThunk<
  ResidentDetails,
  string,
  ResidentThunkConfig
>(
  "residents/fetchResidentDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await residentService.getResidentById(id)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().residents
      return !(state.detailsLoading && state.activeDetailsResidentId === id)
    },
  },
)

export const createResident = createAsyncThunk<
  ResidentDetails,
  CreateResidentRequest,
  ResidentThunkConfig
>(
  "residents/createResident",
  async (data, { rejectWithValue }) => {
    try {
      return await residentService.createResident(data)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  { condition: canStartMutation },
)

export const updateResident = createAsyncThunk<
  ResidentDetails,
  UpdateResidentPayload,
  ResidentThunkConfig
>(
  "residents/updateResident",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await residentService.updateResident(id, data)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  { condition: canStartMutation },
)

const createResidentActionThunk = (
  action: Exclude<ResidentMutation, "create" | "update">,
  serviceAction: (id: string) => Promise<ResidentDetails>,
) =>
  createAsyncThunk<ResidentDetails, string, ResidentThunkConfig>(
    `residents/${action}Resident`,
    async (id, { rejectWithValue }) => {
      try {
        return await serviceAction(id)
      } catch (error) {
        return rejectWithValue(getSafeErrorMessage(error))
      }
    },
    { condition: canStartMutation },
  )

export const approveResident = createResidentActionThunk(
  "approve",
  residentService.approveResident,
)
export const rejectResident = createResidentActionThunk(
  "reject",
  residentService.rejectResident,
)
export const activateResident = createResidentActionThunk(
  "activate",
  residentService.activateResident,
)
export const deactivateResident = createResidentActionThunk(
  "deactivate",
  residentService.deactivateResident,
)
export const blockResident = createResidentActionThunk(
  "block",
  residentService.blockResident,
)
export const unblockResident = createResidentActionThunk(
  "unblock",
  residentService.unblockResident,
)

const updateCachedResident = (
  state: Draft<ResidentsState>,
  resident: ResidentDetails,
  selectResident = false,
  addIfMissing = false,
) => {
  const residentIndex = state.residents.findIndex((item) => item.id === resident.id)

  if (residentIndex >= 0) {
    state.residents[residentIndex] = resident
  } else if (addIfMissing) {
    state.residents.unshift(resident)
  }

  if (selectResident || state.selectedResident?.id === resident.id) {
    state.selectedResident = resident
  }
}

const residentsSlice = createSlice({
  name: "residents",
  initialState,
  reducers: {
    clearSelectedResident: (state) => {
      state.selectedResident = null
      state.detailsLoading = false
      state.activeDetailsRequestId = null
      state.activeDetailsResidentId = null
    },
    clearResidentsError: (state) => {
      state.error = null
    },
    setResidentFilters: (state, action: PayloadAction<ResidentListQuery>) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResidents.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.filters = action.meta.arg
        state.activeListRequestId = action.meta.requestId
        state.activeListQueryKey = getQueryKey(action.meta.arg)
      })
      .addCase(fetchResidents.fulfilled, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.residents = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.activeListRequestId = null
        state.activeListQueryKey = null
      })
      .addCase(fetchResidents.rejected, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.activeListRequestId = null
        state.activeListQueryKey = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Residents could not be loaded."
        }
      })
      .addCase(fetchResidentDetails.pending, (state, action) => {
        state.detailsLoading = true
        state.error = null
        state.activeDetailsRequestId = action.meta.requestId
        state.activeDetailsResidentId = action.meta.arg

        if (state.selectedResident?.id !== action.meta.arg) {
          state.selectedResident = null
        }
      })
      .addCase(fetchResidentDetails.fulfilled, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.selectedResident = action.payload
        state.activeDetailsRequestId = null
        state.activeDetailsResidentId = null
        updateCachedResident(state, action.payload)
      })
      .addCase(fetchResidentDetails.rejected, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.activeDetailsRequestId = null
        state.activeDetailsResidentId = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Resident details could not be loaded."
        }
      })
      .addCase(createResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "create"
        state.error = null
      })
      .addCase(updateResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "update"
        state.error = null
      })
      .addCase(approveResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "approve"
        state.error = null
      })
      .addCase(rejectResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "reject"
        state.error = null
      })
      .addCase(activateResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "activate"
        state.error = null
      })
      .addCase(deactivateResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "deactivate"
        state.error = null
      })
      .addCase(blockResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "block"
        state.error = null
      })
      .addCase(unblockResident.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "unblock"
        state.error = null
      })
      .addMatcher(
        isAnyOf(
          createResident.fulfilled,
          updateResident.fulfilled,
          approveResident.fulfilled,
          rejectResident.fulfilled,
          activateResident.fulfilled,
          deactivateResident.fulfilled,
          blockResident.fulfilled,
          unblockResident.fulfilled,
        ),
        (state, action) => {
          const isNewResident = state.activeMutation === "create"

          state.mutationLoading = false
          state.activeMutation = null
          updateCachedResident(state, action.payload, isNewResident, isNewResident)

          if (isNewResident) {
            state.pagination.total += 1
            state.pagination.totalPages = Math.ceil(
              state.pagination.total / state.pagination.limit,
            )
          }
        },
      )
      .addMatcher(
        isAnyOf(
          createResident.rejected,
          updateResident.rejected,
          approveResident.rejected,
          rejectResident.rejected,
          activateResident.rejected,
          deactivateResident.rejected,
          blockResident.rejected,
          unblockResident.rejected,
        ),
        (state, action) => {
          if (action.meta.condition) return

          state.mutationLoading = false
          state.activeMutation = null
          state.error = action.payload ?? "The resident could not be updated."
        },
      )
  },
})

export const { clearSelectedResident, clearResidentsError, setResidentFilters } =
  residentsSlice.actions
export const residentsReducer = residentsSlice.reducer
