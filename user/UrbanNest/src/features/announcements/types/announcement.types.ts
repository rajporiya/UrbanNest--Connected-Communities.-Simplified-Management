export type AnnouncementStatus = "draft" | "published" | "archived"
export type AnnouncementAudience = "all" | "residents" | "committee" | "security"
export type AnnouncementCategory = "general" | "maintenance" | "event" | "emergency"
export type AnnouncementSort = "newest" | "oldest" | "title_asc" | "title_desc"

export interface AnnouncementAuthor {
  id: string
  name: string
  role: string
  avatarUrl?: string
}

export interface Announcement {
  id: string
  title: string
  summary: string
  content: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  status: AnnouncementStatus
  pinned: boolean
  publishedAt: string | null
  expiresAt: string | null
  author: AnnouncementAuthor
  createdAt: string
  updatedAt: string
}

export interface AnnouncementInput {
  title: string
  summary: string
  content: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  status: AnnouncementStatus
  expiresAt: string
}

export type UpdateAnnouncementInput = Partial<AnnouncementInput>

export interface AnnouncementListQuery {
  page?: number
  limit?: number
  search?: string
  status?: AnnouncementStatus
  category?: AnnouncementCategory
  audience?: AnnouncementAudience
  sort?: AnnouncementSort
}

export interface AnnouncementListResponse {
  items: Announcement[]
  total: number
  page: number
  limit: number
  totalPages: number
}
