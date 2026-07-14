export type ComplaintCategory =
  "maintenance" | "security" | "noise" | "cleanliness" | "parking" | "other"
export type ComplaintPriority = "low" | "medium" | "high" | "emergency"
export type ComplaintStatus =
  "created" | "assigned" | "in-progress" | "resolved" | "closed"
export type ComplaintSort =
  "newest" | "oldest" | "priority_desc" | "priority_asc"

export interface ComplaintImage {
  id: string
  name: string
  url: string
}
export interface ComplaintTimelineEntry {
  id: string
  status: ComplaintStatus
  note: string
  actor: string
  createdAt: string
}
export interface Complaint {
  id: string
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  residentId: string
  residentName: string
  tower: string
  flatNumber: string
  assignedTo?: string
  assignedToId?: string
  images: ComplaintImage[]
  timeline: ComplaintTimelineEntry[]
  createdAt: string
  updatedAt: string
}
export interface ComplaintInput {
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  images: ComplaintImage[]
}
export interface ComplaintListQuery {
  page?: number
  limit?: number
  search?: string
  category?: ComplaintCategory
  priority?: ComplaintPriority
  status?: ComplaintStatus
  sort?: ComplaintSort
  residentId?: string
  assigneeId?: string
}
export interface ComplaintListResponse {
  items: Complaint[]
  total: number
  page: number
  limit: number
  totalPages: number
}
