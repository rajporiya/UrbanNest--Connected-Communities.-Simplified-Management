export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "dev-jwt-secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
}

export const USER_ROLES = {
  COMMITTEE_HEAD: "committee_head",
  COMMITTEE_MEMBER: "committee_member",
  RESIDENT: "resident",
  SECURITY_GUARD: "security_guard",
}

export const USER_ROLE_OPTIONS = Object.values(USER_ROLES)
