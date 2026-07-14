import { CalendarCheck, CircleOff, Clock3, PlayCircle, ScrollText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { EventStatus } from "@/features/events/types/event.types"
import { cn } from "@/utils/cn"

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = {
    draft: { label: "Draft", icon: ScrollText, className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" },
    upcoming: { label: "Upcoming", icon: Clock3, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300" },
    ongoing: { label: "Ongoing", icon: PlayCircle, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
    completed: { label: "Completed", icon: CalendarCheck, className: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300" },
    cancelled: { label: "Cancelled", icon: CircleOff, className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300" },
  } as const
  const entry = config[status]
  const Icon = entry.icon
  return <Badge variant="outline" className={cn("gap-1.5", entry.className)}><Icon className="size-3.5" />{entry.label}</Badge>
}
