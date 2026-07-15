import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { authService } from "@/features/auth/services/auth.service"
import type { AuthUser, ForgotPasswordRequest, LoginRequest, RegisterResidentRequest, ResetPasswordRequest } from "@/features/auth/types/auth.types"

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  loginLoading: boolean
  registerLoading: boolean
  forgotPasswordLoading: boolean
  resetPasswordLoading: boolean
  error: string | null
}

const initialState: AuthState = { user: null, accessToken: null, isAuthenticated: false, isInitializing: false, loginLoading: false, registerLoading: false, forgotPasswordLoading: false, resetPasswordLoading: false, error: null }
const message = (error: unknown) => error instanceof Error ? "We could not complete your request. Please try again." : "Authentication failed."

export const login = createAsyncThunk("auth/login", async (request: LoginRequest, { rejectWithValue }) => { try { return await authService.login(request) } catch (error) { return rejectWithValue(message(error)) } })
export const restoreSession = createAsyncThunk("auth/restoreSession", async (_, { rejectWithValue }) => { try { return await authService.getCurrentUser() } catch (error) { return rejectWithValue(message(error)) } })
export const registerResident = createAsyncThunk("auth/register", async (request: RegisterResidentRequest, { rejectWithValue }) => { try { return await authService.registerResident(request) } catch (error) { return rejectWithValue(message(error)) } })
export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (request: ForgotPasswordRequest, { rejectWithValue }) => { try { return await authService.forgotPassword(request) } catch (error) { return rejectWithValue(message(error)) } })
export const resetPassword = createAsyncThunk("auth/resetPassword", async (request: ResetPasswordRequest, { rejectWithValue }) => { try { return await authService.resetPassword(request) } catch (error) { return rejectWithValue(message(error)) } })

const authSlice = createSlice({
  name: "auth", initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    setMockUser: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload; state.isAuthenticated = true },
    setAccessToken: (state, action: PayloadAction<string | null>) => { state.accessToken = action.payload },
    clearSession: (state) => { state.user = null; state.accessToken = null; state.isAuthenticated = false; state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loginLoading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loginLoading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.isAuthenticated = true })
      .addCase(login.rejected, (state, action) => { state.loginLoading = false; state.error = String(action.payload ?? "Unable to sign in.") })
      .addCase(restoreSession.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true })
      .addCase(registerResident.pending, (state) => { state.registerLoading = true; state.error = null })
      .addCase(registerResident.fulfilled, (state) => { state.registerLoading = false })
      .addCase(registerResident.rejected, (state, action) => { state.registerLoading = false; state.error = String(action.payload) })
      .addCase(forgotPassword.pending, (state) => { state.forgotPasswordLoading = true; state.error = null })
      .addCase(forgotPassword.fulfilled, (state) => { state.forgotPasswordLoading = false })
      .addCase(forgotPassword.rejected, (state, action) => { state.forgotPasswordLoading = false; state.error = String(action.payload) })
      .addCase(resetPassword.pending, (state) => { state.resetPasswordLoading = true; state.error = null })
      .addCase(resetPassword.fulfilled, (state) => { state.resetPasswordLoading = false })
      .addCase(resetPassword.rejected, (state, action) => { state.resetPasswordLoading = false; state.error = String(action.payload) })
  },
})

export const { clearError, setMockUser, setAccessToken, clearSession } = authSlice.actions
export const authReducer = authSlice.reducer
