import type { UserRole } from "@/constants/roles.constants"

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  avatar: string | null
  bio: string
  address: string
  emergencyContact: string
  twoFactorEnabled: boolean
  joinedAt: string
  lastLoginAt: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone: string
  avatar: string | null
  bio: string
  address: string
  emergencyContact: string
}
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
