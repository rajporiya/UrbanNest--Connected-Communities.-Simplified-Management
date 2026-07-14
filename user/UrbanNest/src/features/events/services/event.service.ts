import { mockEvents } from "@/features/events/data/events.mock"
import type { CommunityEvent, EventInput, EventListQuery, EventListResponse, RsvpResponse, UpdateEventInput } from "@/features/events/types/event.types"

const store = structuredClone(mockEvents)
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 230))
const clone = <T,>(value: T): T => structuredClone(value)
const indexOf = (id: string) => { const index = store.findIndex((item) => item.id === id); if (index < 0) throw new Error("Event not found"); return index }
export const eventService = {
  async list(query: EventListQuery = {}): Promise<EventListResponse> { await wait(); const search = query.search?.trim().toLowerCase() ?? ""; const items = store.filter((item) => (!search || `${item.title} ${item.description} ${item.venue}`.toLowerCase().includes(search)) && (!query.status || item.status === query.status) && (!query.category || item.category === query.category)); items.sort((left, right) => query.sort === "latest" ? right.eventDate.localeCompare(left.eventDate) : query.sort === "title_asc" ? left.title.localeCompare(right.title) : left.eventDate.localeCompare(right.eventDate)); const limit = Math.max(1, query.limit ?? 10); const total = items.length; const totalPages = Math.max(1, Math.ceil(total / limit)); const page = Math.min(Math.max(1, query.page ?? 1), totalPages); return { items: clone(items.slice((page - 1) * limit, page * limit)), total, page, limit, totalPages } },
  async get(id: string) { await wait(); return clone(store[indexOf(id)]) },
  async create(input: EventInput) { await wait(); const now = new Date().toISOString(); const item: CommunityEvent = { id: `event-${crypto.randomUUID()}`, ...input, organizer: "Managing Committee", attendeeCount: 0, interestedCount: 0, myRsvp: null, gallery: [], createdAt: now, updatedAt: now }; store.unshift(item); return clone(item) },
  async update(id: string, input: UpdateEventInput) { await wait(); const index = indexOf(id); store[index] = { ...store[index], ...input, updatedAt: new Date().toISOString() }; return clone(store[index]) },
  async remove(id: string) { await wait(); store.splice(indexOf(id), 1); return id },
  async rsvp(id: string, response: RsvpResponse) { await wait(); const index = indexOf(id); const current = store[index]; let attendeeCount = current.attendeeCount; let interestedCount = current.interestedCount; if (current.myRsvp === "going") attendeeCount = Math.max(0, attendeeCount - 1); if (current.myRsvp === "interested") interestedCount = Math.max(0, interestedCount - 1); if (response === "going") attendeeCount += 1; if (response === "interested") interestedCount += 1; store[index] = { ...current, myRsvp: response, attendeeCount, interestedCount, updatedAt: new Date().toISOString() }; return clone(store[index]) },
}
