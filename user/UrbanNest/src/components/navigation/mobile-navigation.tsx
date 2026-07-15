import { useEffect } from "react"

import { AppBrand } from "@/components/common/app-brand"
import { UserAvatar } from "@/components/common/user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { roleLabels } from "@/config/roles.config"
import { useAppSelector } from "@/hooks/use-app-selector"

import { DashboardNavMenu } from "./dashboard-nav-menu"

export interface MobileNavigationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavigation({ open, onOpenChange }: MobileNavigationProps) {
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!user) return null
  const name = `${user.firstName} ${user.lastName}`.trim()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" role="dialog" aria-modal="true" aria-label="Mobile dashboard navigation" className="flex w-[min(20rem,88vw)] flex-col lg:hidden">
        <SheetHeader className="px-5 py-5 text-left">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <AppBrand showTagline={false} logoSize="sm" />
        </SheetHeader>
        <Separator />
        <ScrollArea className="min-h-0 flex-1 px-3 py-4">
          <DashboardNavMenu role={user.role} mobile onNavigate={() => onOpenChange(false)} />
        </ScrollArea>
        <Separator />
        <div className="flex min-w-0 items-center gap-3 p-4">
          <UserAvatar name={name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
