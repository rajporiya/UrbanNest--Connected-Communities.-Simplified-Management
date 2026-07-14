import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/common/theme-toggle"

type TopNavbarProps = {
  onMenuClick: () => void
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon-sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="size-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">Society Management System</p>
            <p className="text-xs text-muted-foreground">Production-ready foundation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Initial setup
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}