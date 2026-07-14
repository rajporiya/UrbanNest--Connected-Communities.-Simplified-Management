import { LayoutDashboard } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { BrandMark } from "@/components/common/brand-mark"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"

export function DashboardLayout() {
  return <div className="min-h-svh bg-background"><header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><Link to={ROUTES.HOME} className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><BrandMark className="size-9 rounded-xl" /><div><p className="text-sm font-semibold">UrbanNest</p><p className="text-xs text-muted-foreground">Management workspace</p></div></Link><div className="flex items-center gap-2"><Button variant="ghost" size="sm" render={<Link to={ROUTES.DASHBOARD} />}><LayoutDashboard />Dashboard</Button><ThemeToggle /></div></div></header><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main></div>
}
