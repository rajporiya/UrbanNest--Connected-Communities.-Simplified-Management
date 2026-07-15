import { mockAnnouncements } from "@/features/announcements/data/announcements.mock"
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListQuery,
  AnnouncementListResponse,
  UpdateAnnouncementInput,
} from "@/features/announcements/types/announcement.types"

const store = structuredClone(mockAnnouncements)
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 220))
const clone = <T,>(value: T): T => structuredClone(value)

function indexOf(id: string) {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Announcement not found")
  return index
}

function sortItems(items: Announcement[], sort: AnnouncementListQuery["sort"]) {
  items.sort((left, right) => {
    if (left.pinned !== right.pinned) return Number(right.pinned) - Number(left.pinned)
    switch (sort ?? "newest") {
      case "oldest": return Date.parse(left.createdAt) - Date.parse(right.createdAt)
      case "title_asc": return left.title.localeCompare(right.title)
      case "title_desc": return right.title.localeCompare(left.title)
      default: return Date.parse(right.createdAt) - Date.parse(left.createdAt)
    }
  })
}

export const announcementService = {
  async list(query: AnnouncementListQuery = {}): Promise<AnnouncementListResponse> {
    await wait()
    const search = query.search?.trim().toLowerCase() ?? ""
    const items = store.filter((item) => {
      const matchesSearch = !search || [item.title, item.summary, item.content, item.author.name].some((value) => value.toLowerCase().includes(search))
      return matchesSearch && (!query.status || item.status === query.status) && (!query.category || item.category === query.category) && (!query.audience || item.audience === query.audience)
    })
    sortItems(items, query.sort)
    const limit = Math.max(1, query.limit ?? 10)
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages)
    return { items: clone(items.slice((page - 1) * limit, page * limit)), total, page, limit, totalPages }
  },
  async get(id: string): Promise<Announcement> {
    await wait()
    return clone(store[indexOf(id)])
  },
  async create(input: AnnouncementInput): Promise<Announcement> {
    await wait()
    const now = new Date().toISOString()
    const item: Announcement = {
      id: `ann-${crypto.randomUUID()}`,
      ...input,
      title: input.title.trim(),
      summary: input.summary.trim(),
      content: input.content.trim(),
      expiresAt: input.expiresAt || null,
      pinned: false,
      publishedAt: input.status === "published" ? now : null,
      author: { id: "user-head-1", name: "Aarav Mehta", role: "Committee Head" },
      createdAt: now,
      updatedAt: now,
    }
    store.unshift(item)
    return clone(item)
  },
  async update(id: string, input: UpdateAnnouncementInput): Promise<Announcement> {
    await wait()
    const index = indexOf(id)
    const current = store[index]
    const nextStatus = input.status ?? current.status
    store[index] = {
      ...current,
      ...input,
      expiresAt: input.expiresAt === "" ? null : (input.expiresAt ?? current.expiresAt),
      publishedAt: nextStatus === "published" ? (current.publishedAt ?? new Date().toISOString()) : current.publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return clone(store[index])
  },
  async remove(id: string): Promise<string> {
    await wait()
    store.splice(indexOf(id), 1)
    return id
  },
  async togglePin(id: string): Promise<Announcement> {
    await wait()
    const index = indexOf(id)
    store[index] = { ...store[index], pinned: !store[index].pinned, updatedAt: new Date().toISOString() }
    return clone(store[index])
  },
}
