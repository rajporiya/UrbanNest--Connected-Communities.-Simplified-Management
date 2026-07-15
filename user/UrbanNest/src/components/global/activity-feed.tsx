import type { ReactNode } from "react"
import { Activity } from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state"

export interface ActivityFeedItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: ReactNode
  trailing?: ReactNode
}
export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  if (!items.length) return <EmptyState compact title="No recent activity" />
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id} className="flex min-w-0 gap-3 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            {item.icon ?? <Activity aria-hidden="true" className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{item.title}</span>
            {item.description ? (
              <span className="block text-xs leading-5 text-muted-foreground">
                {item.description}
              </span>
            ) : null}
            <time className="text-xs text-muted-foreground">{item.time}</time>
          </span>
          {item.trailing}
        </li>
      ))}
    </ul>
  )
}
