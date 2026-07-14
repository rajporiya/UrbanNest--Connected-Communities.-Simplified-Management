import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { LoadingState } from "@/components/feedback/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { AuthPlaceholderPage } from "@/features/auth/auth-placeholder-page"
import { AuthLayout } from "@/layouts/auth-layout"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { PublicLayout } from "@/layouts/public-layout"
import { ProtectedRoute } from "@/routes/protected-route"
import { PublicRoute } from "@/routes/public-route"
import { RoleRoute } from "@/routes/role-route"

const DashboardPage = lazy(() => import("@/features/dashboard/dashboard-page").then((module) => ({ default: module.DashboardPage })))
const HomePage = lazy(() => import("@/features/dashboard/home-page").then((module) => ({ default: module.HomePage })))
const ForbiddenPage = lazy(() => import("@/pages/forbidden-page").then((module) => ({ default: module.ForbiddenPage })))
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((module) => ({ default: module.NotFoundPage })))
const ServerErrorPage = lazy(() => import("@/pages/server-error-page").then((module) => ({ default: module.ServerErrorPage })))

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">This module route is ready for its upcoming implementation.</p></CardContent>
    </Card>
  )
}

const HEAD_ONLY: UserRole[] = [ROLES.COMMITTEE_HEAD]
const RESIDENT_MANAGERS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER]
const COMPLAINT_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const BILLING_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.RESIDENT]
const RESIDENT_ONLY: UserRole[] = [ROLES.RESIDENT]
const GUARD_ONLY: UserRole[] = [ROLES.SECURITY_GUARD]

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState fullScreen label="Loading page..." />}>
        <Routes>
          <Route element={<PublicLayout />}><Route path={ROUTES.HOME} element={<HomePage />} /></Route>
          <Route element={<PublicRoute />}><Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<AuthPlaceholderPage title="Welcome back" description="Authentication forms will be implemented with the auth business module." />} />
            <Route path={ROUTES.REGISTER} element={<AuthPlaceholderPage title="Create your account" description="Registration UI is intentionally reserved for the authentication module." />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<AuthPlaceholderPage title="Forgot password" description="Password recovery UI will connect to the API in a later feature." />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<AuthPlaceholderPage title="Reset password" description="Secure reset form placeholder is configured and ready." />} />
          </Route></Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route element={<RoleRoute allowedRoles={RESIDENT_MANAGERS} />}>
                <Route path={ROUTES.RESIDENTS} element={<ModulePlaceholder title="Residents" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={HEAD_ONLY} />}>
                <Route path={ROUTES.COMMITTEE_MEMBERS} element={<ModulePlaceholder title="Committee Members" />} />
                <Route path={ROUTES.SECURITY_GUARDS} element={<ModulePlaceholder title="Security Guards" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={COMPLAINT_ROLES} />}>
                <Route path={ROUTES.COMPLAINTS} element={<ModulePlaceholder title="Complaints" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={BILLING_ROLES} />}>
                <Route path={ROUTES.MAINTENANCE} element={<ModulePlaceholder title="Maintenance" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={RESIDENT_ONLY} />}>
                <Route path={ROUTES.VISITOR_PASSES} element={<ModulePlaceholder title="Visitor Passes" />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={GUARD_ONLY} />}>
                <Route path={ROUTES.SCAN_VISITOR} element={<ModulePlaceholder title="Scan Visitor QR" />} />
              </Route>
            </Route>
          </Route>

          <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
          <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
