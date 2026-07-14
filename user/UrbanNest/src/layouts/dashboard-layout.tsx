import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { PageContainer } from "@/components/layout/page-container"
import { DashboardHeader, DashboardSidebar, MobileNavigation } from "@/components/navigation"
import { dashboardNavigation, type DashboardNavigationItem } from "@/config/dashboard-navigation.config"
import { useAppSelector } from "@/hooks/use-app-selector"
import { cn } from "@/lib/utils"

function findTitle(items: DashboardNavigationItem[], pathname: string): string | undefined {
  for (const item of items) {
    if (item.href && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)))) return item.label
    const childTitle = item.children ? findTitle(item.children, pathname) : undefined
    if (childTitle) return childTitle
  }
}

export function DashboardLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const sidebarCollapsed = useAppSelector((state) => state.application.sidebarCollapsed)
  const { pathname } = useLocation()
  const title = findTitle(dashboardNavigation, pathname) ?? "UrbanNest"

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <DashboardSidebar />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden transition-[max-width] duration-200 motion-reduce:transition-none",
          sidebarCollapsed ? "lg:max-w-[calc(100vw-5rem)]" : "lg:max-w-[calc(100vw-16rem)]",
        )}
      >
        <DashboardHeader title={title} onOpenMobileMenu={() => setMobileNavigationOpen(true)} />
        <main id="main-content" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto" tabIndex={-1}>
          <PageContainer size="wide">
            <Outlet />
          </PageContainer>
        </main>
      </div>
      <MobileNavigation open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen} />
    </div>
  )
}
