import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Loading } from "@/components/common/loading"
import { persistor, store } from "@/redux/store"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <ThemeProvider defaultTheme="system" storageKey="urban-nest-theme">
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)
