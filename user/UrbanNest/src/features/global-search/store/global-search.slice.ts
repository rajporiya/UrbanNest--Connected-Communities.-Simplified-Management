import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"
import { globalSearchService } from "@/features/global-search/services/global-search.service"
import type { GlobalSearchResult } from "@/features/global-search/types/global-search.types"

export interface GlobalSearchState {
  open: boolean
  query: string
  results: GlobalSearchResult[]
  recent: GlobalSearchResult[]
  loading: boolean
  error: string | null
  activeRequestId: string | null
}
const initialState: GlobalSearchState = {
  open: false,
  query: "",
  results: [],
  recent: [],
  loading: false,
  error: null,
  activeRequestId: null,
}
export const searchGlobally = createAsyncThunk<
  GlobalSearchResult[],
  string,
  { rejectValue: string }
>("globalSearch/search", async (query, { rejectWithValue }) => {
  try {
    return await globalSearchService.search(query)
  } catch {
    return rejectWithValue("Search is temporarily unavailable.")
  }
})
const slice = createSlice({
  name: "globalSearch",
  initialState,
  reducers: {
    openGlobalSearch: (state) => {
      state.open = true
    },
    closeGlobalSearch: (state) => {
      state.open = false
      state.query = ""
      state.results = []
      state.loading = false
      state.error = null
      state.activeRequestId = null
    },
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
      state.error = null
    },
    recordGlobalSearchSelection: (
      state,
      action: PayloadAction<GlobalSearchResult>
    ) => {
      state.recent = [
        action.payload,
        ...state.recent.filter((item) => item.id !== action.payload.id),
      ].slice(0, 5)
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(searchGlobally.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.activeRequestId = action.meta.requestId
      })
      .addCase(searchGlobally.fulfilled, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId || !state.open) {
          return
        }
        state.loading = false
        state.results = action.payload
        state.activeRequestId = null
      })
      .addCase(searchGlobally.rejected, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return
        state.loading = false
        state.activeRequestId = null
        if (action.meta.aborted) return
        state.error = action.payload ?? "Search is temporarily unavailable."
      }),
})
export const {
  openGlobalSearch,
  closeGlobalSearch,
  setGlobalSearchQuery,
  recordGlobalSearchSelection,
} = slice.actions
export const globalSearchReducer = slice.reducer
