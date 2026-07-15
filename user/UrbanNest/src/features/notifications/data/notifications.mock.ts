import type { AppNotification } from "@/features/notifications/types/notification.types"

export const mockNotifications: AppNotification[] = [
  { id: "not-1", title: "Monsoon announcement published", message: "Review the updated terrace access and rainfall safety guidance.", category: "announcement", read: false, createdAt: "2026-07-15T08:15:00.000Z", actionLabel: "View announcement", actionHref: "/announcements/ann-1" },
  { id: "not-2", title: "Visitor waiting at Main Gate", message: "Rohan Shah is waiting for approval to visit Tower B, Flat 804.", category: "visitor", read: false, createdAt: "2026-07-15T07:48:00.000Z", actionLabel: "Review visitor", actionHref: "/visitors" },
  { id: "not-3", title: "July maintenance bill generated", message: "Your maintenance bill of ₹4,850 is due on 25 July 2026.", category: "billing", read: false, createdAt: "2026-07-14T12:30:00.000Z", actionLabel: "View bill", actionHref: "/maintenance" },
  { id: "not-4", title: "Event RSVP confirmed", message: "Your RSVP for the Independence Day cultural evening is confirmed.", category: "event", read: true, createdAt: "2026-07-14T09:10:00.000Z", actionLabel: "View event", actionHref: "/events/event-1" },
  { id: "not-5", title: "Security shift reminder", message: "Your evening shift at Gate A starts at 2:00 PM tomorrow.", category: "security", read: true, createdAt: "2026-07-13T16:00:00.000Z" },
  { id: "not-6", title: "Profile updated", message: "Your UrbanNest profile details were updated successfully.", category: "system", read: true, createdAt: "2026-07-12T11:45:00.000Z", actionLabel: "View profile", actionHref: "/profile" },
  { id: "not-7", title: "Parcel received", message: "A parcel from BlueDart has been received at the service gate.", category: "security", read: false, createdAt: "2026-07-11T13:25:00.000Z", actionLabel: "View parcel", actionHref: "/parcels" },
  { id: "not-8", title: "Payment receipt available", message: "Receipt UN-2026-07142 is ready to download.", category: "billing", read: true, createdAt: "2026-07-10T06:40:00.000Z", actionLabel: "View payment", actionHref: "/payments" },
]
