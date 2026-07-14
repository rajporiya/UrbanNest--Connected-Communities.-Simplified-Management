import { mockAuthUsers } from "@/features/auth/data/mock-auth-users"
import type { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterResidentRequest, ResetPasswordRequest } from "@/features/auth/types/auth.types"

export class AuthServiceError extends Error {
  readonly code: "INVALID_CREDENTIALS" | "INVALID_TOKEN" | "EXPIRED_TOKEN"
  constructor(code: "INVALID_CREDENTIALS" | "INVALID_TOKEN" | "EXPIRED_TOKEN") { super("Authentication request failed"); this.code = code }
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 500))

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    await wait()
    const match = mockAuthUsers.find((user) => user.email.toLowerCase() === request.email.toLowerCase() && user.password === request.password)
    if (!match) throw new AuthServiceError("INVALID_CREDENTIALS")
    const { password: _password, ...user } = match
    void _password
    return { user, accessToken: `mock-token-${user.id}` }
  },
  async registerResident(request: RegisterResidentRequest): Promise<{ message: string }> {
    void request
    await wait()
    return { message: "Registration submitted for committee approval." }
  },
  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    void request
    await wait()
    return { message: "If an account exists for this email, a password reset link has been sent." }
  },
  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await wait()
    if (!request.token || request.token === "invalid") throw new AuthServiceError("INVALID_TOKEN")
    if (request.token === "expired") throw new AuthServiceError("EXPIRED_TOKEN")
    return { message: "Your password has been reset successfully." }
  },
}
