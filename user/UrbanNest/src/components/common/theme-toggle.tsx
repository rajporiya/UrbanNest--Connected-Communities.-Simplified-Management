import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { setTheme as setThemePreference } from "@/features/dashboard/application.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { cn } from "@/utils/cn"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const nextTheme = theme === "light" ? "dark" : "light"
  const label = nextTheme === "dark" ? "Switch to dark mode" : "Switch to light mode"

  const changeTheme = () => {
    setTheme(nextTheme)
    dispatch(setThemePreference(nextTheme))
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={label}
              onClick={changeTheme}
              className="relative overflow-hidden rounded-lg"
            />
          }
        >
          <Sun
            className={cn(
              "absolute size-4 transition-[opacity,transform] duration-200",
              nextTheme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            )}
          />
          <Moon
            className={cn(
              "absolute size-4 transition-[opacity,transform] duration-200",
              nextTheme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            )}
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
