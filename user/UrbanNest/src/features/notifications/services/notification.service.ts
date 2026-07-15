import { mockNotifications } from "@/features/notifications/data/notifications.mock"
import type { AppNotification, NotificationCategory, NotificationListQuery, NotificationListResponse } from "@/features/notifications/types/notification.types"

let store = structuredClone(mockNotifications)
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 180))
const clone = <T,>(value: T): T => structuredClone(value)
const indexOf = (id: string) => { const index = store.findIndex((item) => item.id === id); if (index < 0) throw new Error("Notification not found"); return index }

export const notificationService = {
  async list(query: NotificationListQuery = {}): Promise<NotificationListResponse> {
    await wait()
    const search = query.search?.trim().toLowerCase() ?? ""
    let items = store.filter((item) => {
      const matchesText = !search || `${item.title} ${item.message}`.toLowerCase().includes(search)
      const matchesFilter = !query.filter || query.filter === "all" || (query.filter === "read" ? item.read : !item.read)
      return matchesText && matchesFilter && (!query.category || item.category === query.category)
    }).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    const limit = Math.max(1, query.limit ?? 10)
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages)
    items = items.slice((page - 1) * limit, page * limit)
    return { items: clone(items), total, unread: store.filter((item) => !item.read).length, page, limit, totalPages }
  },
  async markRead(id: string): Promise<AppNotification> { 
    await wait()
    const index = indexOf(id)
    const item = clone(store[index])
    store.splice(index, 1)
    return item
  },
  async markAllRead(): Promise<void> { 
    await wait()
    store = []
  },
  async remove(id: string): Promise<string> { await wait(); store.splice(indexOf(id), 1); return id },
  async add(
    title: string,
    message: string,
    category: NotificationCategory,
    actionHref?: string,
    actionLabel?: string
  ): Promise<AppNotification> {
    await wait()
    const item: AppNotification = {
      id: `not-${globalThis.crypto.randomUUID()}`,
      title,
      message,
      category,
      read: false,
      createdAt: new Date().toISOString(),
      actionHref,
      actionLabel,
    }
    store = [item, ...store]
    return clone(item)
  },
}
