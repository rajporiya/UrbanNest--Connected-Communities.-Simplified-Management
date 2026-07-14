import { AlertTriangle, CheckCircle2, Clock3, CircleDollarSign } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { MaintenancePaymentStatus } from "@/features/maintenance/types/maintenance.types"
import { cn } from "@/lib/utils"

const config = {
  paid: { label: "Paid", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300" },
  pending: { label: "Pending", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300" },
  overdue: { label: "Overdue", icon: AlertTriangle, className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" },
  partially_paid: { label: "Partially paid", icon: CircleDollarSign, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300" },
} as const

export function MaintenanceStatusBadge({ status, className }: { status: MaintenancePaymentStatus; className?: string }) {
  const item = config[status]
  const Icon = item.icon
  return <Badge variant="outline" className={cn("gap-1.5 whitespace-nowrap", item.className, className)}><Icon aria-hidden="true" className="size-3.5" />{item.label}</Badge>
}
