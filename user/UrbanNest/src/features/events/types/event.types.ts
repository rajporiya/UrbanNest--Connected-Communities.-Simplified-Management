export type EventStatus = "draft" | "upcoming" | "ongoing" | "completed" | "cancelled"
export type EventCategory = "cultural" | "sports" | "community" | "meeting" | "workshop"
export type EventAudience = "all" | "residents" | "committee"
export type RsvpResponse = "going" | "interested" | "not_going"
export type EventSort = "soonest" | "latest" | "title_asc"

export interface CommunityEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  audience: EventAudience
  venue: string
  eventDate: string
  startTime: string
  endTime: string
  capacity: number
  status: EventStatus
  organizer: string
  attendeeCount: number
  interestedCount: number
  myRsvp: RsvpResponse | null
  gallery: string[]
  createdAt: string
  updatedAt: string
}

export interface EventInput {
  title: string
  description: string
  category: EventCategory
  audience: EventAudience
  venue: string
  eventDate: string
  startTime: string
  endTime: string
  capacity: number
  status: EventStatus
}
export type UpdateEventInput = Partial<EventInput>
export interface EventListQuery { page?: number; limit?: number; search?: string; status?: EventStatus; category?: EventCategory; sort?: EventSort }
export interface EventListResponse { items: CommunityEvent[]; total: number; page: number; limit: number; totalPages: number }
