import { ROLES } from "@/constants/roles.constants"
import type { UserProfile } from "@/features/profile/types/profile.types"

export const profileMock: UserProfile = {
  id: "user-committee-head",
  firstName: "Aarav",
  lastName: "Mehta",
  email: "head@urbannest.example",
  phone: "+91 98765 43210",
  role: ROLES.COMMITTEE_HEAD,
  avatar: null,
  bio: "Committee Head focused on transparent, responsive community management.",
  address: "Tower A, Flat 1201, UrbanNest Residency",
  emergencyContact: "+91 98765 40000",
  twoFactorEnabled: false,
  joinedAt: "2023-04-01T00:00:00.000Z",
  lastLoginAt: "2026-07-15T08:45:00.000Z",
}
