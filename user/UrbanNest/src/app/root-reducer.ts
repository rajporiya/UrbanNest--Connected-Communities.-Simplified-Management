import { combineReducers } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import { APP_STORAGE_KEY } from "@/constants/app.constants"
import { browserStorage } from "@/app/browser-storage"
import { applicationReducer } from "@/features/dashboard/application.slice"
import { authReducer } from "@/features/auth/store/auth.slice"
import { dashboardReducer } from "@/features/dashboard/store/dashboard.slice"
import { residentsReducer } from "@/features/residents/store/residents.slice"
import { committeeMembersReducer } from "@/features/committee-members/store/committee-members.slice"
import { securityGuardsReducer } from "@/features/security-guards/store/security-guards.slice"
import { towersReducer } from "@/features/towers/store/towers.slice"
import { flatsReducer } from "@/features/flats/store/flats.slice"
import { reportsReducer } from "@/features/reports/store/reports.slice"
import { auditLogsReducer } from "@/features/audit-logs/store/audit-logs.slice"
import { settingsReducer } from "@/features/settings/store/settings.slice"
import { profileReducer } from "@/features/profile/store/profile.slice"
import { globalSearchReducer } from "@/features/global-search/store/global-search.slice"
import { visitorsReducer } from "@/features/visitors/store/visitors.slice"
import { complaintsReducer } from "@/features/complaints/store/complaints.slice"
import { amenitiesReducer } from "@/features/amenities/store/amenities.slice"
import { emergencyReducer } from "@/features/emergency/store/emergency.slice"
import { announcementsReducer } from "@/features/announcements/store/announcements.slice"
import { notificationsReducer } from "@/features/notifications/store/notifications.slice"
import { eventsReducer } from "@/features/events/store/events.slice"
import { pollsReducer } from "@/features/polls/store/polls.slice"
import { documentsReducer } from "@/features/documents/store/documents.slice"
import { maintenanceReducer } from "@/features/maintenance/store/maintenance.slice"
import { paymentsReducer } from "@/features/payments/store/payments.slice"
import { parkingReducer } from "@/features/parking/store/parking.slice"
import { parcelsReducer } from "@/features/parcels/store/parcels.slice"

const persistedApplicationReducer = persistReducer(
  {
    key: `${APP_STORAGE_KEY}-preferences`,
    version: 1,
    storage: browserStorage,
    whitelist: ["sidebarCollapsed", "theme"],
  },
  applicationReducer
)

const persistedAuthReducer = persistReducer(
  {
    key: `${APP_STORAGE_KEY}-auth`,
    version: 1,
    storage: browserStorage,
    // Keep the signed-in session through a page refresh. Transient request
    // state and errors deliberately remain in memory only.
    whitelist: ["user", "accessToken", "isAuthenticated"],
  },
  authReducer
)

export const rootReducer = combineReducers({
  application: persistedApplicationReducer,
  auth: persistedAuthReducer,
  dashboard: dashboardReducer,
  residents: residentsReducer,
  committeeMembers: committeeMembersReducer,
  securityGuards: securityGuardsReducer,
  towers: towersReducer,
  flats: flatsReducer,
  reports: reportsReducer,
  auditLogs: auditLogsReducer,
  settings: settingsReducer,
  profile: profileReducer,
  globalSearch: globalSearchReducer,
  visitors: visitorsReducer,
  complaints: complaintsReducer,
  amenities: amenitiesReducer,
  emergency: emergencyReducer,
  announcements: announcementsReducer,
  notifications: notificationsReducer,
  events: eventsReducer,
  polls: pollsReducer,
  documents: documentsReducer,
  maintenance: maintenanceReducer,
  payments: paymentsReducer,
  parking: parkingReducer,
  parcels: parcelsReducer,
})
export type RootState = ReturnType<typeof rootReducer>
