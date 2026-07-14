import { Badge } from "@/components/ui/badge"
import type { VisitorStatus } from "@/features/visitors/types/visitor.types"
import { cn } from "@/utils/cn"

const styles: Record<VisitorStatus, string> = {
  expected:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  "checked-in":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300",
  "checked-out":
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300",
  cancelled:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
}
const labels: Record<VisitorStatus, string> = {
  expected: "Expected",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
}

export function VisitorStatusBadge({
  status,
  className,
}: {
  status: VisitorStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap", styles[status], className)}
    >
      {labels[status]}
    </Badge>
  )
}
