import { ROLES, type UserRole } from "@/constants/roles.constants"

export const roleLabels: Record<UserRole, string> = {
  [ROLES.COMMITTEE_HEAD]: "Committee Head",
  [ROLES.COMMITTEE_MEMBER]: "Committee Member",
  [ROLES.RESIDENT]: "Resident",
  [ROLES.SECURITY_GUARD]: "Security Guard",
}
