import { Menu } from "@base-ui/react/menu"
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react"

import { useTheme, type Theme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { setTheme as setThemePreference } from "@/features/dashboard/application.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { cn } from "@/utils/cn"

const themeOptions: ReadonlyArray<{ value: Theme; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

export function ThemeModeDropdown() {
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const ActiveIcon = themeOptions.find((option) => option.value === theme)?.icon ?? Monitor

  const selectTheme = (value: unknown) => {
    if (!isTheme(value)) return
    setTheme(value)
    dispatch(setThemePreference(value))
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Theme mode: ${theme}`}
            className="rounded-lg"
          />
        }
      >
        <ActiveIcon className="size-4" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
          <Menu.Popup className="min-w-40 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none">
            <Menu.RadioGroup value={theme} onValueChange={selectTheme}>
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <Menu.RadioItem
                  key={value}
                  value={value}
                  closeOnClick
                  className={cn(
                    "flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1">{label}</span>
                  <Check className={cn("size-4", theme === value ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
