import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type Draft,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { towerService } from "@/features/towers/services/tower.service"
import type {
  CreateTowerRequest,
  TowerDetails,
  TowerListItem,
  TowerListQuery,
  TowerListResponse,
  UpdateTowerRequest,
} from "@/features/towers/types/tower.types"

export type TowerMutation = "create" | "update" | "delete"

export interface TowerPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TowersState {
  towers: TowerListItem[]
  selectedTower: TowerDetails | null
  pagination: TowerPaginationState
  filters: TowerListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  activeMutation: TowerMutation | null
  error: string | null
  activeListRequestId: string | null
  activeListQueryKey: string | null
  activeDetailsRequestId: string | null
  activeDetailsTowerId: string | null
}

interface TowersRootState {
  towers: TowersState
}

export interface UpdateTowerPayload {
  id: string
  data: UpdateTowerRequest
}

interface TowerThunkConfig {
  state: TowersRootState
  rejectValue: string
}

const DEFAULT_PAGE_SIZE = 10

const initialState: TowersState = {
  towers: [],
  selectedTower: null,
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
  activeDetailsTowerId: null,
}

const getSafeErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "The tower request was cancelled."
    if (error.message.trim()) return error.message
  }

  return fallback
}

const getQueryKey = (query: TowerListQuery) =>
  JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_PAGE_SIZE,
    search: query.search ?? "",
    status: query.status ?? "",
    sort: query.sort ?? "",
  })

const canStartMutation = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as TowersRootState).towers.mutationLoading

export const fetchTowers = createAsyncThunk<
  TowerListResponse,
  TowerListQuery,
  TowerThunkConfig
>(
  "towers/fetchTowers",
  async (query, { rejectWithValue }) => {
    try {
      return await towerService.getTowers(query)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "Towers could not be loaded."),
      )
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState().towers
      return !(state.listLoading && state.activeListQueryKey === getQueryKey(query))
    },
  },
)

export const fetchTowerDetails = createAsyncThunk<
  TowerDetails,
  string,
  TowerThunkConfig
>(
  "towers/fetchTowerDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await towerService.getTowerById(id)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "Tower details could not be loaded."),
      )
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().towers
      return !(state.detailsLoading && state.activeDetailsTowerId === id)
    },
  },
)

export const createTower = createAsyncThunk<
  TowerDetails,
  CreateTowerRequest,
  TowerThunkConfig
>(
  "towers/createTower",
  async (data, { rejectWithValue }) => {
    try {
      return await towerService.createTower(data)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The tower could not be created."),
      )
    }
  },
  { condition: canStartMutation },
)

export const updateTower = createAsyncThunk<
  TowerDetails,
  UpdateTowerPayload,
  TowerThunkConfig
>(
  "towers/updateTower",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await towerService.updateTower(id, data)
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The tower could not be updated."),
      )
    }
  },
  { condition: canStartMutation },
)

export const deleteTower = createAsyncThunk<string, string, TowerThunkConfig>(
  "towers/deleteTower",
  async (id, { rejectWithValue }) => {
    try {
      await towerService.deleteTower(id)
      return id
    } catch (error) {
      return rejectWithValue(
        getSafeErrorMessage(error, "The tower could not be deleted."),
      )
    }
  },
  { condition: canStartMutation },
)

const updateCachedTower = (
  state: Draft<TowersState>,
  tower: TowerDetails,
  selectTower = false,
  addIfMissing = false,
) => {
  const towerIndex = state.towers.findIndex((item) => item.id === tower.id)

  if (towerIndex >= 0) {
    state.towers[towerIndex] = tower
  } else if (addIfMissing) {
    state.towers.unshift(tower)
  }

  if (selectTower || state.selectedTower?.id === tower.id) {
    state.selectedTower = tower
  }
}

const towersSlice = createSlice({
  name: "towers",
  initialState,
  reducers: {
    clearSelectedTower: (state) => {
      state.selectedTower = null
      state.detailsLoading = false
      state.activeDetailsRequestId = null
      state.activeDetailsTowerId = null
    },
    clearTowersError: (state) => {
      state.error = null
    },
    setTowerFilters: (state, action: PayloadAction<TowerListQuery>) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTowers.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.filters = action.meta.arg
        state.activeListRequestId = action.meta.requestId
        state.activeListQueryKey = getQueryKey(action.meta.arg)
      })
      .addCase(fetchTowers.fulfilled, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.towers = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.activeListRequestId = null
        state.activeListQueryKey = null
      })
      .addCase(fetchTowers.rejected, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.activeListRequestId = null
        state.activeListQueryKey = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Towers could not be loaded."
        }
      })
      .addCase(fetchTowerDetails.pending, (state, action) => {
        state.detailsLoading = true
        state.error = null
        state.activeDetailsRequestId = action.meta.requestId
        state.activeDetailsTowerId = action.meta.arg

        if (state.selectedTower?.id !== action.meta.arg) {
          state.selectedTower = null
        }
      })
      .addCase(fetchTowerDetails.fulfilled, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.selectedTower = action.payload
        state.activeDetailsRequestId = null
        state.activeDetailsTowerId = null
        updateCachedTower(state, action.payload)
      })
      .addCase(fetchTowerDetails.rejected, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.activeDetailsRequestId = null
        state.activeDetailsTowerId = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Tower details could not be loaded."
        }
      })
      .addCase(createTower.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "create"
        state.error = null
      })
      .addCase(updateTower.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "update"
        state.error = null
      })
      .addCase(deleteTower.pending, (state) => {
        state.mutationLoading = true
        state.activeMutation = "delete"
        state.error = null
      })
      .addCase(deleteTower.fulfilled, (state, action) => {
        const towerIndex = state.towers.findIndex(
          (tower) => tower.id === action.payload,
        )

        state.mutationLoading = false
        state.activeMutation = null

        if (towerIndex >= 0) {
          state.towers.splice(towerIndex, 1)
          state.pagination.total = Math.max(0, state.pagination.total - 1)
          state.pagination.totalPages = Math.max(
            1,
            Math.ceil(state.pagination.total / state.pagination.limit),
          )
        }

        if (state.selectedTower?.id === action.payload) {
          state.selectedTower = null
        }
      })
      .addMatcher(
        isAnyOf(createTower.fulfilled, updateTower.fulfilled),
        (state, action) => {
          const isNewTower = state.activeMutation === "create"

          state.mutationLoading = false
          state.activeMutation = null
          updateCachedTower(
            state,
            action.payload,
            isNewTower,
            isNewTower,
          )

          if (isNewTower) {
            state.pagination.total += 1
            state.pagination.totalPages = Math.max(
              1,
              Math.ceil(state.pagination.total / state.pagination.limit),
            )
          }
        },
      )
      .addMatcher(
        isAnyOf(createTower.rejected, updateTower.rejected, deleteTower.rejected),
        (state, action) => {
          if (action.meta.condition) return

          state.mutationLoading = false
          state.activeMutation = null
          state.error = action.payload ?? "The tower could not be updated."
        },
      )
  },
})

export const { clearSelectedTower, clearTowersError, setTowerFilters } =
  towersSlice.actions

export const towersReducer = towersSlice.reducer

export default towersSlice.reducer
