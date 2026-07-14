import { Badge } from "@/components/ui/badge"
import type { EmergencyStatus } from "@/features/emergency/types/emergency.types"
const styles: Record<EmergencyStatus, string> = {
  pending:
    "border-red-300 bg-red-100 font-semibold text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  responded:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  closed:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
}
export function EmergencyStatusBadge({ status }: { status: EmergencyStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {status === "responded"
        ? "Responded"
        : status === "pending"
          ? "Pending"
          : "Closed"}
    </Badge>
  )
}
