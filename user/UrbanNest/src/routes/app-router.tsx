import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { LoadingState } from "@/components/feedback/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES, type UserRole } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { AuthLayout } from "@/layouts/auth-layout"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { PublicLayout } from "@/layouts/public-layout"
import { ProtectedRoute } from "@/routes/protected-route"
import { PublicRoute } from "@/routes/public-route"
import { RoleRoute } from "@/routes/role-route"

const DashboardPage = lazy(() => import("@/features/dashboard/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })))
const HomePage = lazy(() => import("@/features/dashboard/home-page").then((module) => ({ default: module.HomePage })))
const ForbiddenPage = lazy(() => import("@/pages/forbidden-page").then((module) => ({ default: module.ForbiddenPage })))
const NotFoundPage = lazy(() => import("@/pages/not-found-page").then((module) => ({ default: module.NotFoundPage })))
const ServerErrorPage = lazy(() => import("@/pages/server-error-page").then((module) => ({ default: module.ServerErrorPage })))
const LoginPage = lazy(() => import("@/features/auth/pages/login-page").then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import("@/features/auth/pages/register-page").then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/forgot-password-page").then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/reset-password-page").then((module) => ({ default: module.ResetPasswordPage })))
const ResidentsPage = lazy(() => import("@/features/residents/pages/residents-page").then((module) => ({ default: module.ResidentsPage })))
const ResidentDetailsPage = lazy(() => import("@/features/residents/pages/resident-details-page").then((module) => ({ default: module.ResidentDetailsPage })))
const AddResidentPage = lazy(() => import("@/features/residents/pages/add-resident-page").then((module) => ({ default: module.AddResidentPage })))
const EditResidentPage = lazy(() => import("@/features/residents/pages/edit-resident-page").then((module) => ({ default: module.EditResidentPage })))
const SecurityGuardsPage = lazy(() => import("@/features/security-guards/pages/security-guards-page").then((module) => ({ default: module.SecurityGuardsPage })))
const SecurityGuardDetailsPage = lazy(() => import("@/features/security-guards/pages/security-guard-details-page").then((module) => ({ default: module.SecurityGuardDetailsPage })))
const AddSecurityGuardPage = lazy(() => import("@/features/security-guards/pages/add-security-guard-page").then((module) => ({ default: module.AddSecurityGuardPage })))
const EditSecurityGuardPage = lazy(() => import("@/features/security-guards/pages/edit-security-guard-page").then((module) => ({ default: module.EditSecurityGuardPage })))
const CommitteeMembersPage = lazy(() => import("@/features/committee-members/pages/committee-members-page").then((module) => ({ default: module.CommitteeMembersPage })))
const CommitteeMemberDetailsPage = lazy(() => import("@/features/committee-members/pages/committee-member-details-page").then((module) => ({ default: module.CommitteeMemberDetailsPage })))
const AddCommitteeMemberPage = lazy(() => import("@/features/committee-members/pages/add-committee-member-page").then((module) => ({ default: module.AddCommitteeMemberPage })))
const EditCommitteeMemberPage = lazy(() => import("@/features/committee-members/pages/edit-committee-member-page").then((module) => ({ default: module.EditCommitteeMemberPage })))
const TowersPage = lazy(() => import("@/features/towers/pages/towers-page").then((module) => ({ default: module.TowersPage })))
const TowerDetailsPage = lazy(() => import("@/features/towers/pages/tower-details-page").then((module) => ({ default: module.TowerDetailsPage })))
const AddTowerPage = lazy(() => import("@/features/towers/pages/add-tower-page").then((module) => ({ default: module.AddTowerPage })))
const EditTowerPage = lazy(() => import("@/features/towers/pages/edit-tower-page").then((module) => ({ default: module.EditTowerPage })))
const FlatsPage = lazy(() => import("@/features/flats/pages/flats-page").then((module) => ({ default: module.FlatsPage })))
const FlatDetailsPage = lazy(() => import("@/features/flats/pages/flat-details-page").then((module) => ({ default: module.FlatDetailsPage })))
const AddFlatPage = lazy(() => import("@/features/flats/pages/add-flat-page").then((module) => ({ default: module.AddFlatPage })))
const EditFlatPage = lazy(() => import("@/features/flats/pages/edit-flat-page").then((module) => ({ default: module.EditFlatPage })))

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
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD_TOKEN} element={<ResetPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route></Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route element={<RoleRoute allowedRoles={RESIDENT_MANAGERS} />}>
                <Route path={ROUTES.RESIDENTS} element={<ResidentsPage />} />
                <Route path={ROUTES.RESIDENT_DETAILS} element={<ResidentDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={HEAD_ONLY} />}>
                <Route path={ROUTES.RESIDENT_NEW} element={<AddResidentPage />} />
                <Route path={ROUTES.RESIDENT_EDIT} element={<EditResidentPage />} />
                <Route path={ROUTES.COMMITTEE_MEMBERS} element={<CommitteeMembersPage />} />
                <Route path={ROUTES.COMMITTEE_MEMBER_NEW} element={<AddCommitteeMemberPage />} />
                <Route path={ROUTES.COMMITTEE_MEMBER_DETAILS} element={<CommitteeMemberDetailsPage />} />
                <Route path={ROUTES.COMMITTEE_MEMBER_EDIT} element={<EditCommitteeMemberPage />} />
                <Route path={ROUTES.SECURITY_GUARDS} element={<SecurityGuardsPage />} />
                <Route path={ROUTES.SECURITY_GUARD_NEW} element={<AddSecurityGuardPage />} />
                <Route path={ROUTES.SECURITY_GUARD_DETAILS} element={<SecurityGuardDetailsPage />} />
                <Route path={ROUTES.SECURITY_GUARD_EDIT} element={<EditSecurityGuardPage />} />
                <Route path={ROUTES.TOWERS} element={<TowersPage />} />
                <Route path={ROUTES.TOWER_NEW} element={<AddTowerPage />} />
                <Route path={ROUTES.TOWER_DETAILS} element={<TowerDetailsPage />} />
                <Route path={ROUTES.TOWER_EDIT} element={<EditTowerPage />} />
                <Route path={ROUTES.FLATS} element={<FlatsPage />} />
                <Route path={ROUTES.FLAT_NEW} element={<AddFlatPage />} />
                <Route path={ROUTES.FLAT_DETAILS} element={<FlatDetailsPage />} />
                <Route path={ROUTES.FLAT_EDIT} element={<EditFlatPage />} />
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
