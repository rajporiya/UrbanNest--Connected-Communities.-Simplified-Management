import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { settingsService } from "@/features/settings/services/settings.service"
import type {
  UpdateSettingsRequest,
  UrbanNestSettings,
} from "@/features/settings/types/settings.types"

interface SettingsState {
  data: UrbanNestSettings | null
  loading: boolean
  saving: boolean
  error: string | null
}
const initialState: SettingsState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
}
export const fetchSettings = createAsyncThunk<
  UrbanNestSettings,
  void,
  { rejectValue: string }
>("settings/fetch", async (_, { rejectWithValue }) => {
  try {
    return await settingsService.getSettings()
  } catch {
    return rejectWithValue("Settings could not be loaded.")
  }
})
export const saveSettings = createAsyncThunk<
  UrbanNestSettings,
  UpdateSettingsRequest,
  { rejectValue: string }
>("settings/save", async (data, { rejectWithValue }) => {
  try {
    return await settingsService.updateSettings(data)
  } catch {
    return rejectWithValue("Settings could not be saved.")
  }
})
const slice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Settings could not be loaded."
      })
      .addCase(saveSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saving = false
        state.data = action.payload
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? "Settings could not be saved."
      }),
})
export const settingsReducer = slice.reducer
