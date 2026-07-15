import { Navigate, Outlet } from "react-router-dom"

import { ROUTES } from "@/constants/routes.constants"
import type { UserRole } from "@/constants/roles.constants"
import { useAppSelector } from "@/hooks/use-app-selector"

export interface RoleRouteProps {
  allowedRoles: readonly UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const role = useAppSelector((state) => state.auth.user?.role)
  if (!role || !allowedRoles.includes(role)) return <Navigate to={ROUTES.FORBIDDEN} replace />
  return <Outlet />
}
