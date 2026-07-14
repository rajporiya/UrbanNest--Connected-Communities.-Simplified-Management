import { configureStore } from "@reduxjs/toolkit"
import { persistStore } from "redux-persist"
import { rootReducer } from "@/app/root-reducer"

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/PAUSE", "persist/PURGE", "persist/REGISTER"],
    },
  }),
})

export const persistor = persistStore(store)
export type AppStore = typeof store
export type AppDispatch = AppStore["dispatch"]
export type AppState = ReturnType<AppStore["getState"]>
