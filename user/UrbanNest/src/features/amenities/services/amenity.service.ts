import {
  mockAmenities,
  mockAmenityBookings,
} from "@/features/amenities/data/amenities.mock"
import type {
  Amenity,
  AmenityBooking,
  AmenityBookingInput,
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
    const slot = amenity?.slots.find((item) => item.id === input.slotId)
    if (!amenity || !slot)
      throw new Error("Selected amenity or time slot is unavailable")
    if (input.guests > amenity.capacity)
      throw new Error(`This amenity allows up to ${amenity.capacity} guests`)
    if (
      store.some(
        (item) =>
          item.amenityId === input.amenityId &&
          item.bookingDate === input.bookingDate &&
          item.slot.id === input.slotId &&
          item.status !== "rejected"
      )
    )
      throw new Error("This time slot has already been booked")
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
    return clone(store[index])
  },
}
export type AmenityService = typeof amenityService
