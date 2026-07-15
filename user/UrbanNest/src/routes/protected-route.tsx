import { Navigate, Outlet, useLocation } from "react-router-dom"

import { LoadingState } from "@/components/feedback/loading-state"
import { ROUTES } from "@/constants/routes.constants"
import { useAppSelector } from "@/hooks/use-app-selector"

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (isInitializing) return <LoadingState fullScreen label="Loading your workspace..." />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  return <Outlet />
}
