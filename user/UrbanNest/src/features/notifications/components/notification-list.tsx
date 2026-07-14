import { BellOff } from "lucide-react"

import { EmptyState } from "@/components/feedback/empty-state"
import { NotificationItem } from "@/features/notifications/components/notification-item"
import type { AppNotification } from "@/features/notifications/types/notification.types"

export interface NotificationListProps { notifications: AppNotification[]; compact?: boolean }
export function NotificationList({ notifications, compact = false }: NotificationListProps) {
  if (!notifications.length) return <EmptyState compact={compact} icon={<BellOff />} title="You're all caught up" description="There are no notifications matching this view." />
  return <div className="overflow-hidden rounded-xl border border-border bg-card">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} compact={compact} />)}</div>
}
