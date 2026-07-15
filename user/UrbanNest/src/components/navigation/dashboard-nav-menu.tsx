import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { dashboardNavigation, type DashboardNavigationItem } from "@/config/dashboard-navigation.config"
import type { UserRole } from "@/constants/roles.constants"
import { cn } from "@/lib/utils"

export interface DashboardNavMenuProps {
  role: UserRole
  collapsed?: boolean
  mobile?: boolean
  onNavigate?: () => void
  className?: string
}

function routeIsActive(pathname: string, href?: string) {
  if (!href) return false
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
}

function filterItems(items: DashboardNavigationItem[], role: UserRole): DashboardNavigationItem[] {
  return items.flatMap((navItem) => {
    if (!navItem.roles.includes(role)) return []
    const children = navItem.children?.filter((child) => child.roles.includes(role))
    if (navItem.children && !children?.length) return []
    return [{ ...navItem, children }]
  })
}

export function DashboardNavMenu({ role, collapsed = false, mobile = false, onNavigate, className }: DashboardNavMenuProps) {
  const { pathname } = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set())
  const items = filterItems(dashboardNavigation, role)

  const toggleGroup = (id: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderLink = (navItem: DashboardNavigationItem, nested = false) => {
    const Icon = navItem.icon
    const active = routeIsActive(pathname, navItem.href)
    const link = (
      <NavLink
        to={navItem.href ?? "#"}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-10 items-center rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && !mobile ? "justify-center px-2" : "gap-3 px-3",
          nested && !collapsed && "ml-3",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {collapsed && !mobile ? <span className="sr-only">{navItem.label}</span> : <span className="min-w-0 flex-1 truncate">{navItem.label}</span>}
        {!collapsed && navItem.badge !== undefined ? <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{navItem.badge}</span> : null}
      </NavLink>
    )

    if (!collapsed || mobile) return <li key={navItem.id}>{link}</li>
    return (
      <li key={navItem.id}>
        <Tooltip><TooltipTrigger render={<span className="block" />}>{link}</TooltipTrigger><TooltipContent>{navItem.label}</TooltipContent></Tooltip>
      </li>
    )
  }

  return (
    <TooltipProvider>
      <nav aria-label="Dashboard navigation" className={className}>
        <ul className="space-y-1">
          {items.map((navItem) => {
            if (!navItem.children) return renderLink(navItem)
            const activeChild = navItem.children.some((child) => routeIsActive(pathname, child.href))
            const open = expandedGroups.has(navItem.id) || activeChild
            const Icon = navItem.icon
            return (
              <li key={navItem.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleGroup(navItem.id)}
                  className={cn(
                    "flex min-h-10 w-full items-center rounded-lg text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                    collapsed && !mobile ? "justify-center px-2" : "gap-3 px-3",
                    activeChild && "text-primary",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {collapsed && !mobile ? <span className="sr-only">{navItem.label}</span> : <><span className="flex-1 text-left">{navItem.label}</span><ChevronDown aria-hidden="true" className={cn("size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} /></>}
                </button>
                {open ? <ul className="mt-1 space-y-1">{navItem.children.map((child) => renderLink(child, true))}</ul> : null}
              </li>
            )
          })}
        </ul>
      </nav>
    </TooltipProvider>
  )
}
