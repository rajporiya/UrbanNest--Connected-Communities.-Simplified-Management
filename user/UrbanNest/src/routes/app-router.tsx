import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { Loading } from "@/components/common/loading"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { ProtectedRoute } from "@/routes/protected-route"
import { PublicRoute } from "@/routes/public-route"

const DashboardPage = lazy(() => import("@/pages/dashboard-page"))
const NotFoundPage = lazy(() => import("@/pages/not-found"))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Navigate to="/dashboard" replace />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <PublicRoute>
                <NotFoundPage />
              </PublicRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}