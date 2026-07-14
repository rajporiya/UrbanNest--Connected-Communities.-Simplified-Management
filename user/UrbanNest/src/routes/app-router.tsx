import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthPlaceholderPage } from "@/features/auth/auth-placeholder-page"
import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { HomePage } from "@/features/dashboard/home-page"
import { AuthLayout } from "@/layouts/auth-layout"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { PublicLayout } from "@/layouts/public-layout"
import { ForbiddenPage } from "@/pages/forbidden-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { ServerErrorPage } from "@/pages/server-error-page"
import { ROUTES } from "@/constants/routes.constants"
import { ProtectedRoute } from "@/routes/protected-route"
import { PublicRoute } from "@/routes/public-route"

export function AppRouter() {
  return <BrowserRouter><Routes>
    <Route element={<PublicLayout />}><Route path={ROUTES.HOME} element={<HomePage />} /></Route>
    <Route element={<PublicRoute />}><Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<AuthPlaceholderPage title="Welcome back" description="Authentication forms will be implemented with the auth business module." />} />
      <Route path={ROUTES.REGISTER} element={<AuthPlaceholderPage title="Create your account" description="Registration UI is intentionally reserved for the authentication module." />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<AuthPlaceholderPage title="Forgot password" description="Password recovery UI will connect to the API in a later feature." />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<AuthPlaceholderPage title="Reset password" description="Secure reset form placeholder is configured and ready." />} />
    </Route></Route>
    <Route element={<ProtectedRoute />}><Route element={<DashboardLayout />}><Route path={ROUTES.DASHBOARD} element={<DashboardPage />} /></Route></Route>
    <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
    <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
    <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
  </Routes></BrowserRouter>
}
