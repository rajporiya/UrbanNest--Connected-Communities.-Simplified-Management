import { useEffect, useRef, type ReactNode } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store, type AppDispatch, type AppState } from "@/app/store"
import { Loading } from "@/components/common/loading"
import { restoreSession } from "@/features/auth/store/auth.slice"

function SessionRestorer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const userId = useSelector((state: AppState) => state.auth.user?.id)
  const restoredUserId = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!userId || restoredUserId.current === userId) return
    restoredUserId.current = userId
    void dispatch(restoreSession())
  }, [dispatch, userId])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}><PersistGate loading={<Loading />} persistor={persistor}><SessionRestorer>{children}</SessionRestorer></PersistGate></Provider>
}
