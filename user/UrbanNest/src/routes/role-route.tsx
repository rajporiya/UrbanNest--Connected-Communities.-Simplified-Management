import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { ROUTES } from "@/constants/routes.constants"
import type { UserRole } from "@/constants/roles.constants"
import { useAppSelector } from "@/hooks/use-app-selector"
import { hasRole } from "@/utils/permissions"

export function RoleRoute({ allowedRoles, children }: { allowedRoles: readonly UserRole[]; children?: ReactNode }) {
  const role = useAppSelector((state) => state.auth.user?.role)
  if (!hasRole(role, allowedRoles)) return <Navigate to={ROUTES.FORBIDDEN} replace />
  return children ?? <Outlet />
}
