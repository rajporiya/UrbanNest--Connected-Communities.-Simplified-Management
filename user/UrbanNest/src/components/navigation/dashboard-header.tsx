import { useEffect, useState, type ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import { Bell, LogOut, MenuIcon, Search, Settings, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import { RoleBadge } from "@/components/common/role-badge"
import { ThemeModeDropdown } from "@/components/common/theme-mode-dropdown"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ROUTES } from "@/constants/routes.constants"
import { clearSession } from "@/features/auth/store/auth.slice"
import { openGlobalSearch } from "@/features/global-search/store/global-search.slice"
import { NotificationDrawer } from "@/features/notifications/components/notification-drawer"
import { NotificationUnreadCounter } from "@/features/notifications/components/notification-unread-counter"
import { fetchNotifications } from "@/features/notifications/store/notifications.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import { cn } from "@/lib/utils"

export interface DashboardHeaderProps {
  title?: string
  breadcrumbs?: ReactNode
  onOpenMobileMenu: () => void
  className?: string
}

export function DashboardHeader({ title = "Dashboard", breadcrumbs, onOpenMobileMenu, className }: DashboardHeaderProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "UrbanNest user"

  useEffect(() => {
    void dispatch(fetchNotifications({ page: 1, limit: 8 }))
  }, [dispatch])

  return (
    <header className={cn("sticky top-0 z-40 flex min-h-16 min-w-0 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur sm:px-5", className)}>
      <Button type="button" variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation menu" onClick={onOpenMobileMenu}>
        <MenuIcon aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        {breadcrumbs ? <div className="hidden min-w-0 sm:block">{breadcrumbs}</div> : null}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Search (Ctrl or Command K)" onClick={() => dispatch(openGlobalSearch())} />}>
            <Search aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ThemeModeDropdown />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"} className="relative" onClick={() => setNotificationsOpen(true)} />}>
            <Bell aria-hidden="true" />
            <NotificationUnreadCounter count={unreadCount} className="absolute -right-1 -top-1" />
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <NotificationDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      {user ? (
        <Menu.Root>
          <Menu.Trigger render={<Button type="button" variant="ghost" className="h-10 min-w-0 gap-2 px-1.5 normal-case" aria-label="Open user menu" />}>
            <UserAvatar name={name} size="sm" />
            <span className="hidden max-w-28 truncate text-sm font-medium sm:block">{name}</span>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
              <Menu.Popup className="w-64 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none">
                <div className="min-w-0 px-2.5 py-2">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <RoleBadge role={user.role} className="mt-2" />
                </div>
                <Separator className="my-1" />
                <Menu.Item render={<Link to={ROUTES.PROFILE} />} className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none data-highlighted:bg-accent">
                  <UserRound aria-hidden="true" className="size-4" /> My Profile
                </Menu.Item>
                <Menu.Item render={<Link to={ROUTES.SETTINGS} />} className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none data-highlighted:bg-accent">
                  <Settings aria-hidden="true" className="size-4" /> Settings
                </Menu.Item>
                <Separator className="my-1" />
                <Menu.Item onClick={() => dispatch(clearSession())} className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10">
                  <LogOut aria-hidden="true" className="size-4" /> Logout
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      ) : null}
    </header>
  )
}
