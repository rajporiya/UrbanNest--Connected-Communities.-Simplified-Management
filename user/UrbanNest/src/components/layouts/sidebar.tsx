import { type LucideIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { appConfig, sidebarNavigation } from "@/lib/app-config"
import { cn } from "@/lib/utils"

type SidebarProps = {
  compact?: boolean
  onNavigate?: () => void
}

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-4 shrink-0" />
}

export function Sidebar({ compact = false, onNavigate }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className={cn("flex h-full flex-col bg-card", compact ? "" : "border-r")}>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <span className="font-heading text-lg font-semibold">U</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold tracking-wide text-foreground">{appConfig.name}</p>
          <p className="text-xs text-muted-foreground">Society operations shell</p>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-3 py-4">
          {sidebarNavigation.map((item) => {
            const active = location.pathname === item.href
            const canNavigate = item.href === "/dashboard"

            return (
              <Button
                key={item.href}
                type="button"
                variant={active ? "secondary" : "ghost"}
                className="h-11 w-full justify-start gap-3 px-4 normal-case tracking-normal"
                disabled={!canNavigate}
                onClick={() => {
                  if (canNavigate) {
                    navigate(item.href)
                    onNavigate?.()
                  }
                }}
              >
                <NavIcon icon={item.icon} />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {active ? <span className="size-2 rounded-full bg-primary" /> : null}
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="px-5 py-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Initial setup</p>
        <p className="mt-1 leading-5">
          Layout, routing, and infrastructure are ready. Add business modules when you are set.
        </p>
      </div>
    </aside>
  )
}