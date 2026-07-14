import { Badge } from "@/components/ui/badge"
import { statusBadgeConfig, type StatusType } from "@/config/badge.config"
import { cn } from "@/utils/cn"

interface StatusBadgeProps {
  status: StatusType
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusBadgeConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("w-fit gap-1.5 whitespace-nowrap", config.className, className)}>
      {showIcon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      <span>{config.label}</span>
    </Badge>
  )
}
