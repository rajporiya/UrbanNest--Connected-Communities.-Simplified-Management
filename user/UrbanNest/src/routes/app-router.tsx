import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { LoadingState } from "@/components/feedback/loading-state"
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
const VisitorsPage = lazy(() => import("@/features/visitors").then((module) => ({ default: module.VisitorsPage })))
const CreateVisitorPassPage = lazy(() => import("@/features/visitors").then((module) => ({ default: module.CreateVisitorPassPage })))
const VisitorDetailsPage = lazy(() => import("@/features/visitors").then((module) => ({ default: module.VisitorDetailsPage })))
const VerifyVisitorPage = lazy(() => import("@/features/visitors").then((module) => ({ default: module.VerifyVisitorPage })))
const ComplaintsPage = lazy(() => import("@/features/complaints").then((module) => ({ default: module.ComplaintsPage })))
const CreateComplaintPage = lazy(() => import("@/features/complaints").then((module) => ({ default: module.CreateComplaintPage })))
const ComplaintDetailsPage = lazy(() => import("@/features/complaints").then((module) => ({ default: module.ComplaintDetailsPage })))
const AmenitiesPage = lazy(() => import("@/features/amenities").then((module) => ({ default: module.AmenitiesPage })))
const BookAmenityPage = lazy(() => import("@/features/amenities").then((module) => ({ default: module.BookAmenityPage })))
const AmenityBookingDetailsPage = lazy(() => import("@/features/amenities").then((module) => ({ default: module.AmenityBookingDetailsPage })))
const EmergencyPage = lazy(() => import("@/features/emergency").then((module) => ({ default: module.EmergencyPage })))
const ReportsPage = lazy(() => import("@/features/reports").then((module) => ({ default: module.ReportsPage })))
const AuditLogsPage = lazy(() => import("@/features/audit-logs").then((module) => ({ default: module.AuditLogsPage })))
const SettingsPage = lazy(() => import("@/features/settings").then((module) => ({ default: module.SettingsPage })))
const ProfilePage = lazy(() => import("@/features/profile").then((module) => ({ default: module.ProfilePage })))
const AnnouncementsPage = lazy(() => import("@/features/announcements").then((module) => ({ default: module.AnnouncementsPage })))
const AddAnnouncementPage = lazy(() => import("@/features/announcements").then((module) => ({ default: module.AddAnnouncementPage })))
const AnnouncementDetailsPage = lazy(() => import("@/features/announcements").then((module) => ({ default: module.AnnouncementDetailsPage })))
const EditAnnouncementPage = lazy(() => import("@/features/announcements").then((module) => ({ default: module.EditAnnouncementPage })))
const NotificationsPage = lazy(() => import("@/features/notifications").then((module) => ({ default: module.NotificationsPage })))
const EventsPage = lazy(() => import("@/features/events").then((module) => ({ default: module.EventsPage })))
const AddEventPage = lazy(() => import("@/features/events").then((module) => ({ default: module.AddEventPage })))
const EventDetailsPage = lazy(() => import("@/features/events").then((module) => ({ default: module.EventDetailsPage })))
const EditEventPage = lazy(() => import("@/features/events").then((module) => ({ default: module.EditEventPage })))
const PollsPage = lazy(() => import("@/features/polls").then((module) => ({ default: module.PollsPage })))
const PollDetailsPage = lazy(() => import("@/features/polls").then((module) => ({ default: module.PollDetailsPage })))
const DocumentsPage = lazy(() => import("@/features/documents").then((module) => ({ default: module.DocumentsPage })))
const MaintenanceBillsPage = lazy(() => import("@/features/maintenance").then((module) => ({ default: module.MaintenanceBillsPage })))
const MaintenanceBillDetailsPage = lazy(() => import("@/features/maintenance").then((module) => ({ default: module.MaintenanceBillDetailsPage })))
const GenerateMaintenanceBillPage = lazy(() => import("@/features/maintenance").then((module) => ({ default: module.GenerateMaintenanceBillPage })))
const PaymentsPage = lazy(() => import("@/features/payments").then((module) => ({ default: module.PaymentsPage })))
const PaymentDetailsPage = lazy(() => import("@/features/payments").then((module) => ({ default: module.PaymentDetailsPage })))
const PaymentCheckoutPage = lazy(() => import("@/features/payments").then((module) => ({ default: module.PaymentCheckoutPage })))
const PaymentResultPage = lazy(() => import("@/features/payments").then((module) => ({ default: module.PaymentResultPage })))
const ParkingPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.ParkingPage })))
const ParkingSlotDetailsPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.ParkingSlotDetailsPage })))
const AssignParkingPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.AssignParkingPage })))
const GuestParkingPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.GuestParkingPage })))
const ParkingVehiclesPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.ParkingVehiclesPage })))
const ParkingHistoryPage = lazy(() => import("@/features/parking").then((module) => ({ default: module.ParkingHistoryPage })))
const ParcelsPage = lazy(() => import("@/features/parcels").then((module) => ({ default: module.ParcelsPage })))
const ParcelDetailsPage = lazy(() => import("@/features/parcels").then((module) => ({ default: module.ParcelDetailsPage })))
const ReceiveParcelPage = lazy(() => import("@/features/parcels").then((module) => ({ default: module.ReceiveParcelPage })))

const HEAD_ONLY: UserRole[] = [ROLES.COMMITTEE_HEAD]
const RESIDENT_MANAGERS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER]
const COMPLAINT_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const BILLING_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const BILLING_MANAGERS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER]
const PAYMENT_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.RESIDENT]
const RESIDENT_ONLY: UserRole[] = [ROLES.RESIDENT]
const GUARD_ONLY: UserRole[] = [ROLES.SECURITY_GUARD]
const ALL_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT, ROLES.SECURITY_GUARD]
const COMMUNITY_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const VISITOR_ROLES: UserRole[] = ALL_ROLES
const VISITOR_CREATORS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const AMENITY_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]
const COMMUNITY_MANAGERS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER]
const PARKING_MANAGERS: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER]
const PARKING_ROLES: UserRole[] = [ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT]

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
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.MY_FLAT} element={<ProfilePage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
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
                <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
                <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={COMPLAINT_ROLES} />}>
                <Route path={ROUTES.COMPLAINTS} element={<ComplaintsPage />} />
                <Route path={ROUTES.COMPLAINT_ASSIGNED} element={<ComplaintsPage />} />
                <Route path={ROUTES.COMPLAINT_NEW} element={<CreateComplaintPage />} />
                <Route path={ROUTES.COMPLAINT_DETAILS} element={<ComplaintDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={BILLING_MANAGERS} />}>
                <Route path={ROUTES.MAINTENANCE_GENERATE} element={<GenerateMaintenanceBillPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={BILLING_ROLES} />}>
                <Route path={ROUTES.MAINTENANCE} element={<MaintenanceBillsPage />} />
                <Route path={ROUTES.MAINTENANCE_BILLS} element={<MaintenanceBillsPage />} />
                <Route path={ROUTES.MAINTENANCE_DETAILS} element={<MaintenanceBillDetailsPage />} />
                <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
                <Route path={ROUTES.PAYMENT_DETAILS} element={<PaymentDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={PAYMENT_ROLES} />}>
                <Route path={ROUTES.PAYMENT_CHECKOUT} element={<PaymentCheckoutPage />} />
                <Route path={ROUTES.PAYMENT_RESULT} element={<PaymentResultPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={RESIDENT_ONLY} />}>
                <Route path={ROUTES.VISITOR_PASSES} element={<VisitorsPage />} />
                <Route path={ROUTES.BOOKINGS} element={<AmenitiesPage />} />
                <Route path={ROUTES.AMENITY_BOOK} element={<BookAmenityPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={GUARD_ONLY} />}>
                <Route path={ROUTES.SCAN_VISITOR} element={<VerifyVisitorPage />} />
                <Route path={ROUTES.VISITOR_HISTORY} element={<VisitorsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={VISITOR_CREATORS} />}>
                <Route path={ROUTES.VISITOR_NEW} element={<CreateVisitorPassPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={[ROLES.COMMITTEE_HEAD, ROLES.SECURITY_GUARD]} />}>
                <Route path={ROUTES.VISITOR_VERIFY} element={<VerifyVisitorPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={VISITOR_ROLES} />}>
                <Route path={ROUTES.VISITORS} element={<VisitorsPage />} />
                <Route path={ROUTES.VISITORS_TODAY} element={<VisitorsPage />} />
                <Route path={ROUTES.VISITOR_DETAILS} element={<VisitorDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={AMENITY_ROLES} />}>
                <Route path={ROUTES.AMENITIES} element={<AmenitiesPage />} />
                <Route path={ROUTES.AMENITY_ASSIGNED} element={<AmenitiesPage />} />
                <Route path={ROUTES.AMENITY_BOOKING_DETAILS} element={<AmenityBookingDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={COMMUNITY_MANAGERS} />}>
                <Route path={ROUTES.ANNOUNCEMENT_NEW} element={<AddAnnouncementPage />} />
                <Route path={ROUTES.ANNOUNCEMENT_EDIT} element={<EditAnnouncementPage />} />
                <Route path={ROUTES.EVENT_NEW} element={<AddEventPage />} />
                <Route path={ROUTES.EVENT_EDIT} element={<EditEventPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={COMMUNITY_ROLES} />}>
                <Route path={ROUTES.ANNOUNCEMENTS} element={<AnnouncementsPage />} />
                <Route path={ROUTES.ANNOUNCEMENT_DETAILS} element={<AnnouncementDetailsPage />} />
                <Route path={ROUTES.EVENTS} element={<EventsPage />} />
                <Route path={ROUTES.EVENT_DETAILS} element={<EventDetailsPage />} />
                <Route path={ROUTES.POLLS} element={<PollsPage />} />
                <Route path={ROUTES.POLL_DETAILS} element={<PollDetailsPage />} />
                <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={PARKING_MANAGERS} />}>
                <Route path={ROUTES.PARKING_ASSIGN} element={<AssignParkingPage />} />
                <Route path={ROUTES.PARKING_GUEST} element={<GuestParkingPage />} />
                <Route path={ROUTES.PARKING_VEHICLES} element={<ParkingVehiclesPage />} />
                <Route path={ROUTES.PARKING_HISTORY} element={<ParkingHistoryPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={PARKING_ROLES} />}>
                <Route path={ROUTES.PARKING} element={<ParkingPage />} />
                <Route path={ROUTES.PARKING_DETAILS} element={<ParkingSlotDetailsPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={GUARD_ONLY} />}>
                <Route path={ROUTES.PARCEL_RECEIVE} element={<ReceiveParcelPage />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={ALL_ROLES} />}>
                <Route path={ROUTES.EMERGENCY} element={<EmergencyPage />} />
                <Route path={ROUTES.EMERGENCY_SOS} element={<EmergencyPage />} />
                <Route path={ROUTES.EMERGENCY_ALERTS} element={<EmergencyPage />} />
                <Route path={ROUTES.PARCELS} element={<ParcelsPage />} />
                <Route path={ROUTES.PARCEL_DETAILS} element={<ParcelDetailsPage />} />
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
