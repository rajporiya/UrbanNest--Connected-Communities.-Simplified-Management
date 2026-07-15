import { Badge } from "@/components/ui/badge"
import { roleBadgeConfig } from "@/config/badge.config"
import type { UserRole } from "@/constants/roles.constants"
import { cn } from "@/utils/cn"

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
  className?: string
}

export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const config = roleBadgeConfig[role]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("w-fit gap-1.5 whitespace-nowrap", config.className, className)}>
      {showIcon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      <span>{config.label}</span>
    </Badge>
  )
}
