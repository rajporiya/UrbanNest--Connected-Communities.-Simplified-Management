import {
  complaintAssignees,
  mockComplaints,
} from "@/features/complaints/data/complaints.mock"
import type {
  Complaint,
  ComplaintImage,
  ComplaintInput,
  ComplaintListQuery,
  ComplaintListResponse,
  ComplaintPriority,
  ComplaintStatus,
} from "@/features/complaints/types/complaint.types"
const store = structuredClone(mockComplaints)
const delay = () =>
  new Promise<void>((resolve) => window.setTimeout(resolve, 220))
const clone = <T>(value: T): T => structuredClone(value)
const locate = (id: string) => {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Complaint not found")
  return index
}
const priorityRank: Record<ComplaintPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  emergency: 4,
}
export const complaintService = {
  async list(query: ComplaintListQuery = {}): Promise<ComplaintListResponse> {
    await delay()
    const search = (query.search ?? "").trim().toLowerCase()
    let items = store.filter(
      (item) =>
        (!query.residentId || item.residentId === query.residentId) &&
        (!query.assigneeId || item.assignedToId === query.assigneeId) &&
        (!query.category || item.category === query.category) &&
        (!query.priority || item.priority === query.priority) &&
        (!query.status || item.status === query.status) &&
        (!search ||
          [
            item.title,
            item.description,
            item.residentName,
            item.flatNumber,
            item.assignedTo ?? "",
          ].some((x) => x.toLowerCase().includes(search)))
    )
    items = [...items].sort((a, b) =>
      query.sort === "oldest"
        ? a.createdAt.localeCompare(b.createdAt)
        : query.sort === "priority_desc"
          ? priorityRank[b.priority] - priorityRank[a.priority]
          : query.sort === "priority_asc"
            ? priorityRank[a.priority] - priorityRank[b.priority]
            : b.createdAt.localeCompare(a.createdAt)
    )
    const limit = Math.max(1, query.limit ?? 10)
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages)
    return {
      items: clone(items.slice((page - 1) * limit, page * limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },
  async details(id: string) {
    await delay()
    return clone(store[locate(id)])
  },
  async create(
    input: ComplaintInput,
    resident: { id: string; name: string; tower: string; flatNumber: string }
  ) {
    await delay()
    const now = new Date().toISOString()
    const item: Complaint = {
      ...input,
      id: `cmp-${crypto.randomUUID()}`,
      residentId: resident.id,
      residentName: resident.name,
      tower: resident.tower,
      flatNumber: resident.flatNumber,
      status: "created",
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: crypto.randomUUID(),
          status: "created",
          note: "Complaint submitted by resident.",
          actor: resident.name,
          createdAt: now,
        },
      ],
    }
    store.unshift(item)
    return clone(item)
  },
  async assign(id: string, assigneeId: string, note: string) {
    await delay()
    const index = locate(id)
    const assignee = complaintAssignees.find((item) => item.id === assigneeId)
    if (!assignee) throw new Error("Committee member not found")
    const now = new Date().toISOString()
    store[index] = {
      ...store[index],
      assignedToId: assignee.id,
      assignedTo: assignee.name,
      status: "assigned",
      updatedAt: now,
      timeline: [
        ...store[index].timeline,
        {
          id: crypto.randomUUID(),
          status: "assigned",
          note: note.trim() || `Assigned to ${assignee.name}.`,
          actor: "Committee Head",
          createdAt: now,
        },
      ],
    }
    return clone(store[index])
  },
  async updateStatus(
    id: string,
    status: ComplaintStatus,
    note: string,
    actor = "Committee Member"
  ) {
    await delay()
    const index = locate(id)
    const now = new Date().toISOString()
    store[index] = {
      ...store[index],
      status,
      updatedAt: now,
      timeline: [
        ...store[index].timeline,
        {
          id: crypto.randomUUID(),
          status,
          note: note.trim(),
          actor,
          createdAt: now,
        },
      ],
    }
    return clone(store[index])
  },
  makeImages(files: readonly File[]): ComplaintImage[] {
    return files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
    }))
  },
}
export type ComplaintService = typeof complaintService
