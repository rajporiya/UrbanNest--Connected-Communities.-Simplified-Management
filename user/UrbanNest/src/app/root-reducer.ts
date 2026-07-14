import { combineReducers } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { APP_STORAGE_KEY } from "@/constants/app.constants"
import { applicationReducer } from "@/features/dashboard/application.slice"
import { authReducer } from "@/features/auth/store/auth.slice"
import { dashboardReducer } from "@/features/dashboard/store/dashboard.slice"
import { residentsReducer } from "@/features/residents/store/residents.slice"
import { committeeMembersReducer } from "@/features/committee-members/store/committee-members.slice"
import { securityGuardsReducer } from "@/features/security-guards/store/security-guards.slice"
import { towersReducer } from "@/features/towers/store/towers.slice"
import { flatsReducer } from "@/features/flats/store/flats.slice"

const persistedApplicationReducer = persistReducer(
  {
    key: `${APP_STORAGE_KEY}-preferences`,
    version: 1,
    storage,
    whitelist: ["sidebarCollapsed", "theme"],
  },
  applicationReducer
)

export const rootReducer = combineReducers({ application: persistedApplicationReducer, auth: authReducer, dashboard: dashboardReducer, residents: residentsReducer, committeeMembers: committeeMembersReducer, securityGuards: securityGuardsReducer, towers: towersReducer, flats: flatsReducer })
export type RootState = ReturnType<typeof rootReducer>
