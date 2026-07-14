import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { ROUTES } from "@/constants/routes.constants"
import { useAppSelector } from "@/hooks/use-app-selector"

type PublicRouteProps = {
  children: ReactNode
}

export function PublicRoute({ children }: Partial<PublicRouteProps>) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />
  return children ?? <Outlet />
}
