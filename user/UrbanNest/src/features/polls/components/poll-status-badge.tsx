import { CircleCheck, Clock3, LockKeyhole } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { PollStatus } from "@/features/polls/types/poll.types"
import { cn } from "@/utils/cn"

const config = { open: { label: "Open", icon: CircleCheck, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" }, upcoming: { label: "Upcoming", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300" }, closed: { label: "Closed", icon: LockKeyhole, className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" } } as const
export function PollStatusBadge({ status }: { status: PollStatus }) { const entry = config[status]; const Icon = entry.icon; return <Badge variant="outline" className={cn("gap-1.5", entry.className)}><Icon className="size-3.5" />{entry.label}</Badge> }
