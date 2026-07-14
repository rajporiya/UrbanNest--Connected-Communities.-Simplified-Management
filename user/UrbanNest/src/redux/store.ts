import { configureStore } from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist"
import storage from "redux-persist/lib/storage"

import { rootReducer, type RootState } from "@/redux/root-reducer"

const persistConfig = {
  key: "urban-nest",
  version: 1,
  storage,
  blacklist: [],
}

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
})

export const persistor = persistStore(store)

export type AppStore = typeof store
export type AppDispatch = AppStore["dispatch"]
export type AppState = ReturnType<typeof store.getState>