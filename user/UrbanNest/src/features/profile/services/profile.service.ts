import type { AuthUser } from "@/features/auth/types/auth.types"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import { API_ENDPOINTS } from "@/services/api-endpoints"
import { api } from "@/services/api-client"
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

type ApiProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  profileImage?: { secure_url?: string } | null
  createdAt?: string
  lastLoginAt?: string
}

const roleMap: Record<string, UserRole> = {
  "committee head": ROLES.COMMITTEE_HEAD,
  "committe head": ROLES.COMMITTEE_HEAD,
  "committee member": ROLES.COMMITTEE_MEMBER,
  resident: ROLES.RESIDENT,
  "security guard": ROLES.SECURITY_GUARD,
}

function toUserProfile(profile: ApiProfile, existing?: UserProfile): UserProfile {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    role: roleMap[profile.role.trim().toLowerCase()] ?? ROLES.RESIDENT,
    avatar: profile.profileImage?.secure_url ?? null,
    bio: existing?.bio ?? "",
    address: existing?.address ?? "",
    emergencyContact: existing?.emergencyContact ?? "",
    twoFactorEnabled: existing?.twoFactorEnabled ?? false,
    joinedAt: profile.createdAt ?? existing?.joinedAt ?? new Date().toISOString(),
    lastLoginAt: profile.lastLoginAt ?? existing?.lastLoginAt ?? "",
  }
}

export const profileService = {
  async getProfile(user: AuthUser): Promise<UserProfile> {
    activeProfileId = user.id
    const existing = profileStore.get(user.id)
    const response = await api.get<{ user: ApiProfile }>(API_ENDPOINTS.profile)
    const profile = toUserProfile(response.data.user, existing)
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
