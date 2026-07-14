export type AmenityType =
  | "gym"
  | "club-house"
  | "swimming-pool"
  | "community-hall"
  | "garden"
  | "indoor-games"
export type BookingStatus = "pending" | "approved" | "rejected"
export type BookingSort = "date_asc" | "date_desc" | "newest"
export interface AmenitySlot {
  id: string
  label: string
  startTime: string
  endTime: string
  available: boolean
}
export interface Amenity {
  id: AmenityType
  name: string
  description: string
  location: string
  capacity: number
  imageClass: string
  requiresApproval: boolean
  slots: AmenitySlot[]
}
export interface AmenityBooking {
  id: string
  amenityId: AmenityType
  amenityName: string
  residentId: string
  residentName: string
  tower: string
  flatNumber: string
  bookingDate: string
  slot: AmenitySlot
  guests: number
  purpose: string
  status: BookingStatus
  reviewNote?: string
  createdAt: string
}
export interface AmenityBookingInput {
  amenityId: AmenityType
  bookingDate: string
  slotId: string
  guests: number
  purpose: string
}
export interface BookingListQuery {
  page?: number
  limit?: number
  search?: string
  amenityId?: AmenityType
  status?: BookingStatus
  sort?: BookingSort
  residentId?: string
}
export interface BookingListResponse {
  items: AmenityBooking[]
  total: number
  page: number
  limit: number
  totalPages: number
}
