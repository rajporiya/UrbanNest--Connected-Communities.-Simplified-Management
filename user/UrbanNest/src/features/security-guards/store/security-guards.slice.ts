import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type Draft,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { securityGuardService } from "@/features/security-guards/services/security-guard.service"
import type {
  CreateSecurityGuardRequest,
  SecurityGuardDetails,
  SecurityGuardListItem,
  SecurityGuardListQuery,
  SecurityGuardListResponse,
  UpdateSecurityGuardRequest,
} from "@/features/security-guards/types/security-guard.types"

export type SecurityGuardMutation =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"

export interface SecurityGuardPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SecurityGuardsState {
  securityGuards: SecurityGuardListItem[]
  selectedSecurityGuard: SecurityGuardDetails | null
  pagination: SecurityGuardPaginationState
  filters: SecurityGuardListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  activeMutation: SecurityGuardMutation | null
  error: string | null
  activeListRequestId: string | null
  activeListQueryKey: string | null
  activeDetailsRequestId: string | null
  activeDetailsGuardId: string | null
}

interface SecurityGuardsRootState {
  securityGuards: SecurityGuardsState
}

export interface UpdateSecurityGuardPayload {
  id: string
  data: UpdateSecurityGuardRequest
}

interface SecurityGuardThunkConfig {
  state: SecurityGuardsRootState
  rejectValue: string
}

const DEFAULT_PAGE_SIZE = 10

const initialState: SecurityGuardsState = {
  securityGuards: [],
  selectedSecurityGuard: null,
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
  activeDetailsGuardId: null,
}

const getSafeErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "The security guard request was cancelled."
    if (error.message.trim()) return error.message
  }

  return fallback
}

const getQueryKey = (query: SecurityGuardListQuery) =>
  JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_PAGE_SIZE,
    search: query.search ?? "",
    gate: query.gate ?? "",
    shift: query.shift ?? "",
    status: query.status ?? "",
    sort: query.sort ?? "",
  })

const canStartMutation = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as SecurityGuardsRootState).securityGuards.mutationLoading

export const fetchSecurityGuards = createAsyncThunk<
  SecurityGuardListResponse,
  SecurityGuardListQuery,
  SecurityGuardThunkConfig
>(
  "securityGuards/fetchSecurityGuards",
  async (query, { rejectWithValue }) => {
    try {
      return await securityGuardService.getSecurityGuards(query)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "Security guards could not be loaded."),
      )
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState().securityGuards
      return !(state.listLoading && state.activeListQueryKey === getQueryKey(query))
    },
  },
)

export const fetchSecurityGuardDetails = createAsyncThunk<
  SecurityGuardDetails,
  string,
  SecurityGuardThunkConfig
>(
  "securityGuards/fetchSecurityGuardDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await securityGuardService.getSecurityGuardById(id)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "Security guard details could not be loaded."),
      )
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().securityGuards
      return !(state.detailsLoading && state.activeDetailsGuardId === id)
    },
  },
)

export const createSecurityGuard = createAsyncThunk<
  SecurityGuardDetails,
  CreateSecurityGuardRequest,
  SecurityGuardThunkConfig
>(
  "securityGuards/createSecurityGuard",
  async (data, { rejectWithValue }) => {
    try {
      return await securityGuardService.createSecurityGuard(data)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The security guard could not be created."),
      )
    }
  },
  { condition: canStartMutation },
)

export const updateSecurityGuard = createAsyncThunk<
  SecurityGuardDetails,
  UpdateSecurityGuardPayload,
  SecurityGuardThunkConfig
>(
  "securityGuards/updateSecurityGuard",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await securityGuardService.updateSecurityGuard(id, data)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The security guard could not be updated."),
      )
    }
  },
  { condition: canStartMutation },
)

export const deleteSecurityGuard = createAsyncThunk<
  string,
  string,
  SecurityGuardThunkConfig
>(
  "securityGuards/deleteSecurityGuard",
  async (id, { rejectWithValue }) => {
    try {
      await securityGuardService.deleteSecurityGuard(id)
      return id
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The security guard could not be removed."),
      )
    }
  },
  { condition: canStartMutation },
)

const createStatusThunk = (
  action: Extract<SecurityGuardMutation, "activate" | "deactivate">,
  serviceAction: (id: string) => Promise<SecurityGuardDetails>,
) =>
  createAsyncThunk<SecurityGuardDetails, string, SecurityGuardThunkConfig>(
    `securityGuards/${action}SecurityGuard`,
    async (id, { rejectWithValue }) => {
      try {
        return await serviceAction(id)
      } catch (error) {
        return rejectWithValue(
          getSafeErrorMessage(error, `The security guard could not be ${action}d.`),
        )
      }
    },
    { condition: canStartMutation },
  )

export const activateSecurityGuard = createStatusThunk(
  "activate",
  securityGuardService.activateSecurityGuard,
)

export const deactivateSecurityGuard = createStatusThunk(
  "deactivate",
  securityGuardService.deactivateSecurityGuard,
)

const updateCachedSecurityGuard = (
  state: Draft<SecurityGuardsState>,
  guard: SecurityGuardDetails,
  selectGuard = false,
  addIfMissing = false,
) => {
  const guardIndex = state.securityGuards.findIndex((item) => item.id === guard.id)

  if (guardIndex >= 0) {
    state.securityGuards[guardIndex] = guard
  } else if (addIfMissing) {
    state.securityGuards.unshift(guard)
  }

  if (selectGuard || state.selectedSecurityGuard?.id === guard.id) {
    state.selectedSecurityGuard = guard
  }
}

const securityGuardsSlice = createSlice({
  name: "securityGuards",
  initialState,
  reducers: {
    clearSelectedSecurityGuard: (state) => {
      state.selectedSecurityGuard = null
      state.detailsLoading = false
      state.activeDetailsRequestId = null
      state.activeDetailsGuardId = null
    },
    clearSecurityGuardsError: (state) => {
      state.error = null
    },
    setSecurityGuardFilters: (
      state,
      action: PayloadAction<SecurityGuardListQuery>,
    ) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecurityGuards.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.filters = action.meta.arg
        state.activeListRequestId = action.meta.requestId
        state.activeListQueryKey = getQueryKey(action.meta.arg)
      })
      .addCase(fetchSecurityGuards.fulfilled, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.securityGuards = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.activeListRequestId = null
        state.activeListQueryKey = null
      })
      .addCase(fetchSecurityGuards.rejected, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.activeListRequestId = null
        state.activeListQueryKey = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Security guards could not be loaded."
        }
      })
      .addCase(fetchSecurityGuardDetails.pending, (state, action) => {
        state.detailsLoading = true
        state.error = null
        state.activeDetailsRequestId = action.meta.requestId
        state.activeDetailsGuardId = action.meta.arg

        if (state.selectedSecurityGuard?.id !== action.meta.arg) {
          state.selectedSecurityGuard = null
        }
      })
      .addCase(fetchSecurityGuardDetails.fulfilled, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.selectedSecurityGuard = action.payload
        state.activeDetailsRequestId = null
        state.activeDetailsGuardId = null
        updateCachedSecurityGuard(state, action.payload)
      })
      .addCase(fetchSecurityGuardDetails.rejected, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.activeDetailsRequestId = null
        state.activeDetailsGuardId = null
        if (!action.meta.condition) {
          state.error =
            action.payload ?? "Security guard details could not be loaded."
        }
      })
      .addCase(createSecurityGuard.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "create"
        state.error = null
      })
      .addCase(updateSecurityGuard.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "update"
        state.error = null
      })
      .addCase(deleteSecurityGuard.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "delete"
        state.error = null
      })
      .addCase(activateSecurityGuard.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "activate"
        state.error = null
      })
      .addCase(deactivateSecurityGuard.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "deactivate"
        state.error = null
      })
      .addCase(deleteSecurityGuard.fulfilled, (state, action) => {
        const guardIndex = state.securityGuards.findIndex(
          (guard) => guard.id === action.payload,
        )

        state.mutationLoading = false
        state.activeMutation = null

        if (guardIndex >= 0) {
          state.securityGuards.splice(guardIndex, 1)
          state.pagination.total = Math.max(0, state.pagination.total - 1)
          state.pagination.totalPages = Math.max(
            1,
            Math.ceil(state.pagination.total / state.pagination.limit),
          )
        }

        if (state.selectedSecurityGuard?.id === action.payload) {
          state.selectedSecurityGuard = null
        }
      })
      .addMatcher(
        isAnyOf(
          createSecurityGuard.fulfilled,
          updateSecurityGuard.fulfilled,
          activateSecurityGuard.fulfilled,
          deactivateSecurityGuard.fulfilled,
        ),
        (state, action) => {
          const isNewSecurityGuard = state.activeMutation === "create"

          state.mutationLoading = false
          state.activeMutation = null
          updateCachedSecurityGuard(
            state,
            action.payload,
            isNewSecurityGuard,
            isNewSecurityGuard,
          )

          if (isNewSecurityGuard) {
            state.pagination.total += 1
            state.pagination.totalPages = Math.max(
              1,
              Math.ceil(state.pagination.total / state.pagination.limit),
            )
          }
        },
      )
      .addMatcher(
        isAnyOf(
          createSecurityGuard.rejected,
          updateSecurityGuard.rejected,
          deleteSecurityGuard.rejected,
          activateSecurityGuard.rejected,
          deactivateSecurityGuard.rejected,
        ),
        (state, action) => {
          if (action.meta.condition) return

          state.mutationLoading = false
          state.activeMutation = null
          state.error = action.payload ?? "The security guard could not be updated."
        },
      )
  },
})

export const {
  clearSelectedSecurityGuard,
  clearSecurityGuardsError,
  setSecurityGuardFilters,
} = securityGuardsSlice.actions

export const securityGuardsReducer = securityGuardsSlice.reducer

export default securityGuardsSlice.reducer
