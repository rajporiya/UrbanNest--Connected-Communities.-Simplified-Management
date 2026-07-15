import { mockVisitors } from "@/features/visitors/data/visitors.mock"
import type {
  VisitorListQuery,
  VisitorListResponse,
  VisitorPass,
  VisitorPassInput,
  VisitorReport,
} from "@/features/visitors/types/visitor.types"

const store = structuredClone(mockVisitors)
const delay = () =>
  new Promise<void>((resolve) => window.setTimeout(resolve, 220))
const clone = <T>(value: T): T => structuredClone(value)
const locate = (id: string) => {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Visitor pass not found")
  return index
}

export const visitorService = {
  async list(query: VisitorListQuery = {}): Promise<VisitorListResponse> {
    await delay()
    const search = (query.search ?? "").trim().toLowerCase()
    let items = store.filter(
      (item) =>
        (!query.residentId || item.residentId === query.residentId) &&
        (!query.status || item.status === query.status) &&
        (!query.purpose || item.purpose === query.purpose) &&
        (!search ||
          [
            item.visitorName,
            item.mobile,
            item.residentName,
            item.flatNumber,
            item.qrCode,
          ].some((value) => value.toLowerCase().includes(search)))
    )
    items = [...items].sort((a, b) =>
      query.sort === "visit_asc"
        ? a.visitDate.localeCompare(b.visitDate)
        : query.sort === "name_asc"
          ? a.visitorName.localeCompare(b.visitorName)
          : query.sort === "name_desc"
            ? b.visitorName.localeCompare(a.visitorName)
            : b.visitDate.localeCompare(a.visitDate)
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
  async details(id: string): Promise<VisitorPass> {
    await delay()
    return clone(store[locate(id)])
  },
  async create(
    input: VisitorPassInput,
    resident: { id: string; name: string; tower: string; flatNumber: string }
  ): Promise<VisitorPass> {
    await delay()
    const item: VisitorPass = {
      ...input,
      vehicleNumber: input.vehicleNumber || undefined,
      id: `vp-${crypto.randomUUID()}`,
      residentId: resident.id,
      residentName: resident.name,
      tower: resident.tower,
      flatNumber: resident.flatNumber,
      qrCode: `UN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "expected",
      createdAt: new Date().toISOString(),
    }
    store.unshift(item)

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      "Visitor pass created",
      `A visitor pass has been generated for ${input.visitorName} scheduled on ${input.visitDate}.`,
      "visitor",
      `/visitors`,
      "View pass"
    )

    return clone(item)
  },
  async verify(code: string): Promise<VisitorPass> {
    await delay()
    const item = store.find(
      (candidate) =>
        candidate.qrCode.toLowerCase() === code.trim().toLowerCase()
    )
    if (!item) throw new Error("No valid visitor pass matches this QR code")
    if (item.status === "cancelled")
      throw new Error("This visitor pass was cancelled")
    return clone(item)
  },
  async checkIn(id: string, guardName = "Security desk"): Promise<VisitorPass> {
    await delay()
    const index = locate(id)
    if (store[index].status !== "expected")
      throw new Error("Only expected visitors can check in")
    store[index] = {
      ...store[index],
      status: "checked-in",
      checkedInAt: new Date().toISOString(),
      verifiedBy: guardName,
    }

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      "Visitor checked in",
      `${store[index].visitorName} has checked in at the main gate for Flat ${store[index].flatNumber}.`,
      "visitor",
      `/visitors`,
      "View details"
    )

    return clone(store[index])
  },
  async checkOut(id: string): Promise<VisitorPass> {
    await delay()
    const index = locate(id)
    if (store[index].status !== "checked-in")
      throw new Error("Visitor is not currently checked in")
    store[index] = {
      ...store[index],
      status: "checked-out",
      checkedOutAt: new Date().toISOString(),
    }
    return clone(store[index])
  },
  async cancel(id: string): Promise<VisitorPass> {
    await delay()
    const index = locate(id)
    if (store[index].status !== "expected")
      throw new Error("Only expected visits can be cancelled")
    store[index] = { ...store[index], status: "cancelled" }
    return clone(store[index])
  },
  async report(): Promise<VisitorReport> {
    await delay()
    const today = new Date().toISOString().slice(0, 10)
    return {
      total: store.length,
      expected: store.filter((x) => x.status === "expected").length,
      inside: store.filter((x) => x.status === "checked-in").length,
      completed: store.filter((x) => x.status === "checked-out").length,
      today: store.filter((x) => x.visitDate === today).length,
    }
  },
}

export type VisitorService = typeof visitorService
