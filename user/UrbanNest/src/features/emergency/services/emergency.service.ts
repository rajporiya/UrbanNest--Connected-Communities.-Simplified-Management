import { mockEmergencyAlerts } from "@/features/emergency/data/emergency.mock"
import type {
  EmergencyAlert,
  EmergencyInput,
  EmergencyListQuery,
  EmergencyListResponse,
} from "@/features/emergency/types/emergency.types"
const store = structuredClone(mockEmergencyAlerts)
const delay = () =>
  new Promise<void>((resolve) => window.setTimeout(resolve, 180))
const clone = <T>(value: T): T => structuredClone(value)
const locate = (id: string) => {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Emergency alert not found")
  return index
}
export const emergencyService = {
  async list(query: EmergencyListQuery = {}): Promise<EmergencyListResponse> {
    await delay()
    const search = (query.search ?? "").toLowerCase()
    let items = store.filter(
      (item) =>
        (!query.residentId || item.residentId === query.residentId) &&
        (!query.type || item.type === query.type) &&
        (!query.status || item.status === query.status) &&
        (!search ||
          [
            item.residentName,
            item.flatNumber,
            item.tower,
            item.message,
            item.mobile,
          ].some((x) => x.toLowerCase().includes(search)))
    )
    items = [...items].sort((a, b) =>
      query.sort === "oldest"
        ? a.createdAt.localeCompare(b.createdAt)
        : query.sort === "priority"
          ? a.status === "pending"
            ? -1
            : 1
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
  async create(
    input: EmergencyInput,
    resident: { id: string; name: string; tower: string; flatNumber: string }
  ) {
    await delay()
    const item: EmergencyAlert = {
      ...input,
      id: `sos-${crypto.randomUUID()}`,
      residentId: resident.id,
      residentName: resident.name,
      tower: resident.tower,
      flatNumber: resident.flatNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    store.unshift(item)
    return clone(item)
  },
  async respond(id: string, responder: string) {
    await delay()
    const index = locate(id)
    if (store[index].status !== "pending")
      throw new Error("This emergency has already been acknowledged")
    store[index] = {
      ...store[index],
      status: "responded",
      respondedBy: responder,
      respondedAt: new Date().toISOString(),
    }
    return clone(store[index])
  },
  async close(id: string) {
    await delay()
    const index = locate(id)
    if (store[index].status !== "responded")
      throw new Error("An emergency must be responded to before closing")
    store[index] = {
      ...store[index],
      status: "closed",
      closedAt: new Date().toISOString(),
    }
    return clone(store[index])
  },
}
export type EmergencyService = typeof emergencyService
