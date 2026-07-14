import { combineReducers } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { APP_STORAGE_KEY } from "@/constants/app.constants"
import { applicationReducer } from "@/features/dashboard/application.slice"
import { authReducer } from "@/features/auth/store/auth.slice"
import { dashboardReducer } from "@/features/dashboard/store/dashboard.slice"

const persistedApplicationReducer = persistReducer(
  {
    key: `${APP_STORAGE_KEY}-preferences`,
    version: 1,
    storage,
    whitelist: ["sidebarCollapsed", "theme"],
  },
  applicationReducer
)

export const rootReducer = combineReducers({ application: persistedApplicationReducer, auth: authReducer, dashboard: dashboardReducer })
export type RootState = ReturnType<typeof rootReducer>
