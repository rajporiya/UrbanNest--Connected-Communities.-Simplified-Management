import type { UserRole } from "@/constants/roles.constants"

export function hasRole(role: UserRole | null | undefined, allowedRoles: readonly UserRole[]) {
  return Boolean(role && allowedRoles.includes(role))
}

export function hasPermission(userPermissions: readonly string[] | null | undefined, permission: string) {
  return Boolean(userPermissions?.includes(permission))
}
