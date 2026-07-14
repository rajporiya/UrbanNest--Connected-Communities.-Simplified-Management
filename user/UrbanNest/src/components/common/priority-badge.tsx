import { Badge } from "@/components/ui/badge"
import { priorityBadgeConfig, type PriorityType } from "@/config/badge.config"
import { cn } from "@/utils/cn"

interface PriorityBadgeProps {
  priority: PriorityType
  showIcon?: boolean
  className?: string
}

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  const config = priorityBadgeConfig[priority]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("w-fit gap-1.5 whitespace-nowrap", config.className, className)}>
      {showIcon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      <span>{config.label}</span>
    </Badge>
  )
}
