import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { AppBrand } from "@/components/common/app-brand"
import AppLogo from "@/components/common/app-logo"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { setSidebarCollapsed } from "@/features/dashboard/application.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import { cn } from "@/lib/utils"

import { DashboardNavMenu } from "./dashboard-nav-menu"

export function DashboardSidebar({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector((state) => state.application.sidebarCollapsed)
  const role = useAppSelector((state) => state.auth.user?.role)

  if (!role) return null

  return (
    <aside className={cn("sticky top-0 hidden h-svh shrink-0 border-r border-border bg-background transition-[width] duration-200 motion-reduce:transition-none lg:flex lg:flex-col", collapsed ? "w-20" : "w-64", className)}>
      <div className={cn("flex h-20 items-center", collapsed ? "justify-center px-2" : "px-5")}>
        {collapsed ? <AppLogo size="sm" showText={false} /> : <AppBrand showTagline={false} logoSize="sm" />}
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <DashboardNavMenu role={role} collapsed={collapsed} />
      </ScrollArea>
      <Separator />
      <div className={cn("p-3", collapsed ? "flex justify-center" : "flex justify-end")}>
        <Button type="button" variant="ghost" size={collapsed ? "icon-sm" : "sm"} onClick={() => dispatch(setSidebarCollapsed(!collapsed))} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>
    </aside>
  )
}
