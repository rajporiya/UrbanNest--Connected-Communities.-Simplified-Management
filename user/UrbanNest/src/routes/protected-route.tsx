import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { ROUTES } from "@/constants/routes.constants"
import { useAppSelector } from "@/hooks/use-app-selector"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: Partial<ProtectedRouteProps>) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  return children ?? <Outlet />
}
