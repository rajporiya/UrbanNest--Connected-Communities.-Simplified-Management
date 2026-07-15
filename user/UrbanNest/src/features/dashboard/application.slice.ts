import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ThemePreference } from "@/types/common.types"

export type ApplicationState = {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  theme: ThemePreference
  globalLoading: boolean
}

export const initialApplicationState: ApplicationState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: "light",
  globalLoading: false,
}

const applicationSlice = createSlice({
  name: "application",
  initialState: initialApplicationState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => { state.sidebarCollapsed = action.payload },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => { state.mobileSidebarOpen = action.payload },
    setTheme: (state, action: PayloadAction<ThemePreference>) => { state.theme = action.payload },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => { state.globalLoading = action.payload },
  },
})

export const { setSidebarCollapsed, setMobileSidebarOpen, setTheme, setGlobalLoading } = applicationSlice.actions
export const applicationReducer = applicationSlice.reducer
