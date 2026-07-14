import type { ReactNode } from "react"
import { Toaster } from "sonner"
import { THEME_STORAGE_KEY } from "@/constants/app.constants"
import { ReduxProvider } from "@/providers/redux-provider"
import { ThemeProvider } from "@/providers/theme-provider"

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider defaultTheme="system" storageKey={THEME_STORAGE_KEY}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </ReduxProvider>
  )
}
