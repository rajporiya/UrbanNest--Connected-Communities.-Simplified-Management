import { api } from "@/services/api-client"
import { API_ENDPOINTS } from "@/services/api-endpoints"
import type { AuthUser, ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterResidentRequest, ResetPasswordRequest } from "@/features/auth/types/auth.types"
import type { UserRole } from "@/constants/roles.constants"

export class AuthServiceError extends Error {
  readonly code: "INVALID_CREDENTIALS" | "INVALID_TOKEN" | "EXPIRED_TOKEN"
  constructor(code: "INVALID_CREDENTIALS" | "INVALID_TOKEN" | "EXPIRED_TOKEN") { super("Authentication request failed"); this.code = code }
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 500))

type ApiUser = {
  _id?: string
  id?: string
  firstName: string
  lastName: string
  email: string
  role: string
  profileImage?: { secure_url?: string } | null
}

type ApiLoginResponse = { user: ApiUser; accessToken: string; refreshToken: string }

const roleMap: Record<string, UserRole> = {
  "committee head": "committee_head",
  "committe head": "committee_head",
  "committee member": "committee_member",
  resident: "resident",
  "security guard": "security_guard",
}

const toUserRole = (role: string): UserRole =>
  roleMap[role.trim().toLowerCase()] ?? "resident"

function toAuthUser(user: ApiUser): AuthUser {
  return {
    id: user._id ?? user.id ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: toUserRole(user.role),
    avatar: user.profileImage?.secure_url || null,
  }
}

function registrationPayload(request: RegisterResidentRequest) {
  const names = request.fullName.trim().split(/\s+/)
  const firstName = names.shift() || request.fullName.trim()
  const lastName = names.join(" ") || "Resident"

  return {
    firstName,
    lastName,
    email: request.email,
    phone: request.mobile,
    password: request.password,
    confirmPassword: request.confirmPassword,
    role: "Resident",
    tower: request.tower,
    flat: request.flatNumber,
  }
}

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiLoginResponse, Pick<LoginRequest, "email" | "password">>(
      API_ENDPOINTS.auth.login,
      { email: request.email, password: request.password },
    )
    return { user: toAuthUser(response.data.user), accessToken: response.data.accessToken }
  },
  async registerResident(request: RegisterResidentRequest): Promise<{ message: string }> {
    const response = await api.post<{ user: ApiUser }, ReturnType<typeof registrationPayload>>(
      API_ENDPOINTS.auth.register,
      registrationPayload(request),
    )
    return { message: response.message }
  },
  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<{ user: ApiUser }>("/auth/profile")
    return toAuthUser(response.data.user)
  },
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    void request
    await wait()
    return { message: "If an account exists for this email, a password reset link has been sent." }
  },
  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await wait()
    if (!request.token || request.token === "invalid") throw new AuthServiceError("INVALID_TOKEN")
    return { message: "Your password has been reset successfully." }
  },
}
