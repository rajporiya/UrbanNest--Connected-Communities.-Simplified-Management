export const ROLES = {
  COMMITTEE_HEAD: "committee_head",
  COMMITTEE_MEMBER: "committee_member",
  RESIDENT: "resident",
  SECURITY_GUARD: "security_guard",
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]
export const USER_ROLES = Object.values(ROLES)
