import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ROLES } from "@/constants/roles.constants"
import type { AuthState, AuthUser } from "@/types/auth.types"

const initialState: AuthState = {
  isAuthenticated: true,
  accessToken: null,
  user: {
    id: "mock-committee-head",
    firstName: "Aarav",
    lastName: "Shah",
    email: "aarav@urbannest.local",
    role: ROLES.COMMITTEE_HEAD,
  },
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMockUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => { state.accessToken = action.payload },
    clearSession: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setMockUser, setAccessToken, clearSession } = authSlice.actions
export const authReducer = authSlice.reducer
