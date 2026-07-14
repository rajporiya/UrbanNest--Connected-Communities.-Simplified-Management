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

const profileStore = new Map<string, UserProfile>()
let activeProfileId: string | null = null
const wait = () =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, 200))

function getActiveProfile() {
  if (!activeProfileId) throw new Error("No active profile is selected")
  const profile = profileStore.get(activeProfileId)
  if (!profile) throw new Error("The active profile could not be found")
  return profile
}

export const profileService = {
  async getProfile(user: AuthUser): Promise<UserProfile> {
    await wait()
    activeProfileId = user.id
    const existing = profileStore.get(user.id)
    const profile: UserProfile = existing ?? {
      ...structuredClone(profileMock),
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? profileMock.avatar ?? null,
    }
    profileStore.set(user.id, profile)
    return structuredClone(profile)
  },
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    await wait()
    const parsed = profileSchema.parse(data)
    const profile = { ...getActiveProfile(), ...parsed }
    profileStore.set(profile.id, profile)
    return structuredClone(profile)
  },
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await wait()
    changePasswordSchema.parse(data)
    if (data.currentPassword === "incorrect")
      throw new Error("Current password is incorrect")
  },
  async setTwoFactor(enabled: boolean): Promise<UserProfile> {
    await wait()
    const profile = { ...getActiveProfile(), twoFactorEnabled: enabled }
    profileStore.set(profile.id, profile)
    return structuredClone(profile)
  },
}
