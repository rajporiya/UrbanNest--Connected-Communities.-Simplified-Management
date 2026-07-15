import { Clock3 } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/feedback/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DashboardActivity } from "@/features/dashboard/types/dashboard.types"

export interface RecentActivityListProps { activities: DashboardActivity[]; loading?: boolean; emptyTitle?: string; emptyDescription?: string }
function relativeTime(value: string) { const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return "Just now"; if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago` }
export function RecentActivityList({ activities, loading = false, emptyTitle = "No recent activity", emptyDescription = "New activity will appear here." }: RecentActivityListProps) {
  if (loading) return <div role="status" className="space-y-3"><span className="sr-only">Loading recent activity</span>{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div>
  if (!activities.length) return <EmptyState compact title={emptyTitle} description={emptyDescription} />
  return <ScrollArea className="max-h-80"><ul className="divide-y divide-border">{activities.map((activity) => { const content = <><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{activity.icon ?? <Clock3 aria-hidden="true" className="size-4" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{activity.title}</span>{activity.description ? <span className="block truncate text-xs text-muted-foreground">{activity.description}</span> : null}</span><span className="shrink-0 text-xs text-muted-foreground">{relativeTime(activity.timestamp)}</span>{activity.status}</>; return <li key={activity.id}>{activity.href ? <Link to={activity.href} className="flex items-center gap-3 rounded-lg px-2 py-3 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring">{content}</Link> : <div className="flex items-center gap-3 px-2 py-3">{content}</div>}</li> })}</ul></ScrollArea>
}
