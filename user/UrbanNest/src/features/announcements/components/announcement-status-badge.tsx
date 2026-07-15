import { Archive, CircleCheck, Clock3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { AnnouncementStatus } from "@/features/announcements/types/announcement.types"
import { cn } from "@/utils/cn"

export function AnnouncementStatusBadge({ status }: { status: AnnouncementStatus }) {
  const config = {
    published: { label: "Published", icon: CircleCheck, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" },
    draft: { label: "Draft", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300" },
    archived: { label: "Archived", icon: Archive, className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" },
  } as const
  const entry = config[status]
  const Icon = entry.icon
  return <Badge variant="outline" className={cn("gap-1.5", entry.className)}><Icon className="size-3.5" />{entry.label}</Badge>
}
