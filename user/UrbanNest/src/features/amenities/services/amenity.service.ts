import {
  mockAmenities,
  mockAmenityBookings,
} from "@/features/amenities/data/amenities.mock"
import type {
  Amenity,
  AmenityBooking,
  AmenityBookingInput,
  AmenitySlot,
  BookingListQuery,
  BookingListResponse,
  BookingStatus,
} from "@/features/amenities/types/amenity.types"
const store = structuredClone(mockAmenityBookings)
const delay = () =>
  new Promise<void>((resolve) => window.setTimeout(resolve, 220))
const clone = <T>(value: T): T => structuredClone(value)
const locate = (id: string) => {
  const index = store.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Booking not found")
  return index
}
export const amenityService = {
  async amenities(): Promise<Amenity[]> {
    await delay()
    return clone(mockAmenities)
  },
  async list(query: BookingListQuery = {}): Promise<BookingListResponse> {
    await delay()
    const search = (query.search ?? "").toLowerCase()
    let items = store.filter(
      (item) =>
        (!query.residentId || item.residentId === query.residentId) &&
        (!query.viewerResidentId ||
          item.status === "approved" ||
          item.residentId === query.viewerResidentId) &&
        (!query.amenityId || item.amenityId === query.amenityId) &&
        (!query.status || item.status === query.status) &&
        (!search ||
          [
            item.amenityName,
            item.residentName,
            item.flatNumber,
            item.purpose,
          ].some((x) => x.toLowerCase().includes(search)))
    )
    items = [...items].sort((a, b) =>
      query.sort === "date_asc"
        ? a.bookingDate.localeCompare(b.bookingDate)
        : query.sort === "newest"
          ? b.createdAt.localeCompare(a.createdAt)
          : b.bookingDate.localeCompare(a.bookingDate)
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
    input: AmenityBookingInput,
    resident: { id: string; name: string; tower: string; flatNumber: string }
  ) {
    await delay()
    const amenity = mockAmenities.find((item) => item.id === input.amenityId)
    if (!amenity) throw new Error("Selected amenity is unavailable")

    let slot: AmenitySlot | undefined
    if (input.slotId.startsWith("custom-")) {
      const parts = input.slotId.split("-")
      const startTime = parts[1]
      const endTime = parts[2]
      slot = {
        id: input.slotId,
        label: `${startTime}–${endTime}`,
        startTime,
        endTime,
        available: true,
      }
    } else {
      slot = amenity.slots.find((item) => item.id === input.slotId)
    }

    if (!slot) throw new Error("Selected time slot is unavailable")
    if (input.guests > amenity.capacity)
      throw new Error(`This amenity allows up to ${amenity.capacity} guests`)

    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + (m || 0)
    }
    const startMins = timeToMinutes(slot.startTime)
    const endMins = timeToMinutes(slot.endTime)

    if (startMins >= endMins) {
      throw new Error("End time must be after start time")
    }

    const hasOverlap = store.some(
      (item) =>
        item.amenityId === input.amenityId &&
        item.bookingDate === input.bookingDate &&
        item.status !== "rejected" &&
        timeToMinutes(item.slot.startTime) < endMins &&
        timeToMinutes(item.slot.endTime) > startMins
    )
    if (hasOverlap) {
      throw new Error("This time slot overlaps with an existing booking")
    }

    const item: AmenityBooking = {
      id: `book-${crypto.randomUUID()}`,
      amenityId: amenity.id,
      amenityName: amenity.name,
      residentId: resident.id,
      residentName: resident.name,
      tower: resident.tower,
      flatNumber: resident.flatNumber,
      bookingDate: input.bookingDate,
      slot,
      guests: input.guests,
      purpose: input.purpose.trim(),
      status: amenity.requiresApproval ? "pending" : "approved",
      createdAt: new Date().toISOString(),
    }
    store.unshift(item)

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      "New booking requested",
      `${resident.name} requested to book the ${amenity.name} for ${input.bookingDate} (${slot.label}).`,
      "system",
      `/amenities`,
      "View bookings"
    )

    return clone(item)
  },
  async review(
    id: string,
    status: Exclude<BookingStatus, "pending">,
    note: string
  ) {
    await delay()
    const index = locate(id)
    if (store[index].status !== "pending")
      throw new Error("Only pending bookings can be reviewed")
    store[index] = {
      ...store[index],
      status,
      reviewNote: note.trim() || undefined,
    }

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      `Booking ${status}`,
      `Your booking request for the ${store[index].amenityName} on ${store[index].bookingDate} has been ${status}.`,
      "system",
      `/amenities`,
      "View details"
    )

    return clone(store[index])
  },
}
export type AmenityService = typeof amenityService
