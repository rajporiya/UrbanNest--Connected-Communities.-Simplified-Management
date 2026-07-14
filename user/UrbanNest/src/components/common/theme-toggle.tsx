import { MoonStar, SunMedium } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { setTheme as setThemePreference } from "@/features/dashboard/application.slice"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()

  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={() => {
        setTheme(nextTheme)
        dispatch(setThemePreference(nextTheme))
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  )
}
