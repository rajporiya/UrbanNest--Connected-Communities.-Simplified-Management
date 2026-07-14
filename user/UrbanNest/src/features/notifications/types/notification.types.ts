export type NotificationCategory = "announcement" | "billing" | "visitor" | "event" | "security" | "system"
export type NotificationFilter = "all" | "unread" | "read"

export interface AppNotification {
  id: string
  title: string
  message: string
  category: NotificationCategory
  read: boolean
  createdAt: string
  actionLabel?: string
  actionHref?: string
}

export interface NotificationListQuery {
  page?: number
  limit?: number
  search?: string
  filter?: NotificationFilter
  category?: NotificationCategory
}

export interface NotificationListResponse {
  items: AppNotification[]
  total: number
  unread: number
  page: number
  limit: number
  totalPages: number
}
