import type { UserRole } from "@/constants/roles.constants"

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

export type AuthState = {
  isAuthenticated: boolean
  accessToken: string | null
  user: AuthUser | null
}
