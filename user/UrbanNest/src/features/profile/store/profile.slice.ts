import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { AuthUser } from "@/features/auth/types/auth.types"
import { profileService } from "@/features/profile/services/profile.service"
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/features/profile/types/profile.types"

interface ProfileState {
  data: UserProfile | null
  loading: boolean
  saving: boolean
  passwordLoading: boolean
  securityLoading: boolean
  error: string | null
}
const initialState: ProfileState = {
  data: null,
  loading: false,
  saving: false,
  passwordLoading: false,
  securityLoading: false,
  error: null,
}
export const fetchProfile = createAsyncThunk<
  UserProfile,
  AuthUser,
  { rejectValue: string }
>("profile/fetch", async (user, { rejectWithValue }) => {
  try {
    return await profileService.getProfile(user)
  } catch {
    return rejectWithValue("Profile could not be loaded.")
  }
})
export const updateProfile = createAsyncThunk<
  UserProfile,
  UpdateProfileRequest,
  { rejectValue: string }
>("profile/update", async (data, { rejectWithValue }) => {
  try {
    return await profileService.updateProfile(data)
  } catch {
    return rejectWithValue("Profile could not be updated.")
  }
})
export const changeProfilePassword = createAsyncThunk<
  void,
  ChangePasswordRequest,
  { rejectValue: string }
>("profile/password", async (data, { rejectWithValue }) => {
  try {
    await profileService.changePassword(data)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Password could not be changed."
    )
  }
})
export const setProfileTwoFactor = createAsyncThunk<
  UserProfile,
  boolean,
  { rejectValue: string }
>("profile/twoFactor", async (enabled, { rejectWithValue }) => {
  try {
    return await profileService.setTwoFactor(enabled)
  } catch {
    return rejectWithValue("Two-factor preference could not be changed.")
  }
})
const slice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Profile could not be loaded."
      })
      .addCase(updateProfile.pending, (state) => {
        state.saving = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saving = false
        state.data = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload ?? "Profile could not be updated."
      })
      .addCase(changeProfilePassword.pending, (state) => {
        state.passwordLoading = true
      })
      .addCase(changeProfilePassword.fulfilled, (state) => {
        state.passwordLoading = false
      })
      .addCase(changeProfilePassword.rejected, (state, action) => {
        state.passwordLoading = false
        state.error = action.payload ?? "Password could not be changed."
      })
      .addCase(setProfileTwoFactor.pending, (state) => {
        state.securityLoading = true
      })
      .addCase(setProfileTwoFactor.fulfilled, (state, action) => {
        state.securityLoading = false
        state.data = action.payload
      })
      .addCase(setProfileTwoFactor.rejected, (state, action) => {
        state.securityLoading = false
        state.error =
          action.payload ?? "Security preference could not be changed."
      }),
})
export const profileReducer = slice.reducer
