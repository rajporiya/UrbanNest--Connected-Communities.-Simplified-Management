import type { UserRole } from "@/constants/roles.constants"

export type { UserRole }

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar?: string | null
}

export interface LoginRequest { email: string; password: string; rememberMe: boolean }
export interface LoginResponse { user: AuthUser; accessToken: string }
export interface RegisterResidentRequest { fullName: string; email: string; mobile: string; password: string; confirmPassword: string; tower: string; flatNumber: string; termsAccepted: boolean }
export interface ForgotPasswordRequest { email: string }
export interface ResetPasswordRequest { token: string; password: string; confirmPassword: string }
