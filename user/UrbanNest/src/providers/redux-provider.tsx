import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store } from "@/app/store"
import { Loading } from "@/components/common/loading"

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}><PersistGate loading={<Loading />} persistor={persistor}>{children}</PersistGate></Provider>
}
