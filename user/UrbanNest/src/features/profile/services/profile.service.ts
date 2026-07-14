import type { AuthUser } from "@/features/auth/types/auth.types"
import { profileMock } from "@/features/profile/data/profile.mock"
import {
  changePasswordSchema,
  profileSchema,
} from "@/features/profile/schemas/profile.schema"
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/features/profile/types/profile.types"

let profileStore = structuredClone(profileMock)
const wait = () =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, 200))

export const profileService = {
  async getProfile(user: AuthUser): Promise<UserProfile> {
    await wait()
    profileStore = {
      ...profileStore,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: profileStore.avatar ?? user.avatar ?? null,
    }
    return structuredClone(profileStore)
  },
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    await wait()
    const parsed = profileSchema.parse(data)
    profileStore = { ...profileStore, ...parsed }
    return structuredClone(profileStore)
  },
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await wait()
    changePasswordSchema.parse(data)
    if (data.currentPassword === "incorrect")
      throw new Error("Current password is incorrect")
  },
  async setTwoFactor(enabled: boolean): Promise<UserProfile> {
    await wait()
    profileStore = { ...profileStore, twoFactorEnabled: enabled }
    return structuredClone(profileStore)
  },
}
