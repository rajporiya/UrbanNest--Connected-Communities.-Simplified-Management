import { ROLES } from "@/constants/roles.constants"
import type { AuthUser } from "@/features/auth/types/auth.types"

export interface MockAuthUser extends AuthUser { password: string }

export const mockAuthUsers: readonly MockAuthUser[] = [
  { id: "mock-head", firstName: "Aarav", lastName: "Shah", email: "head@urbannest.local", role: ROLES.COMMITTEE_HEAD, password: "UrbanNest@123" },
  { id: "mock-member", firstName: "Meera", lastName: "Patel", email: "member@urbannest.local", role: ROLES.COMMITTEE_MEMBER, password: "UrbanNest@123" },
  { id: "mock-resident", firstName: "Raj", lastName: "Poriya", email: "resident@urbannest.local", role: ROLES.RESIDENT, password: "UrbanNest@123" },
  { id: "mock-guard", firstName: "Vikram", lastName: "Singh", email: "guard@urbannest.local", role: ROLES.SECURITY_GUARD, password: "UrbanNest@123" },
]
