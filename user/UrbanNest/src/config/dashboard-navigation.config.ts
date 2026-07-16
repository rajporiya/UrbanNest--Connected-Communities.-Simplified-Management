import type { LucideIcon } from "lucide-react"
import {
  Bell, Building2, CalendarDays, CircleDollarSign, ClipboardCheck, FileText,
  Gauge, House, Landmark, Megaphone, Package, ParkingCircle, ReceiptText,
  ScrollText, Settings, ShieldCheck, Users, UserPlus, Vote, Wrench,
} from "lucide-react"

import { ROLES, type UserRole } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"

export interface DashboardNavigationItem {
  id: string
  label: string
  href?: string
  icon: LucideIcon
  roles: UserRole[]
  badge?: string | number
  children?: DashboardNavigationItem[]
}

const H = ROLES.COMMITTEE_HEAD
const M = ROLES.COMMITTEE_MEMBER
const R = ROLES.RESIDENT
const G = ROLES.SECURITY_GUARD
const item = (id: string, label: string, href: string, icon: LucideIcon, roles: UserRole[]): DashboardNavigationItem => ({ id, label, href, icon, roles })

export const dashboardNavigation: DashboardNavigationItem[] = [
  item("dashboard", "Dashboard", ROUTES.DASHBOARD, Gauge, [H, M, R, G]),
  {
    id: "management", label: "Management", icon: Users, roles: [H, M], children: [
      item("residents", "Residents", ROUTES.RESIDENTS, Users, [H, M]),
      item("committee-members", "Committee Members", ROUTES.COMMITTEE_MEMBERS, ShieldCheck, [H]),
      item("security-guards", "Security Guards", ROUTES.SECURITY_GUARDS, ShieldCheck, [H]),
      item("towers", "Towers", ROUTES.TOWERS, Building2, [H]),
      item("flats", "Flats", ROUTES.FLATS, House, [H]),
    ],
  },
  {
    id: "operations", label: "Operations", icon: ClipboardCheck, roles: [H, M, R], children: [
      item("visitors", "Visitors", ROUTES.VISITORS, ClipboardCheck, [H, M]),
      item("visitor-passes", "Visitor Passes", ROUTES.VISITOR_PASSES, ClipboardCheck, [R]),
      item("complaints", "Complaints", ROUTES.COMPLAINTS, Wrench, [H, R]),
      item("assigned-complaints", "Assigned Complaints", ROUTES.COMPLAINT_ASSIGNED, Wrench, [M]),
      item("amenities", "Amenities", ROUTES.AMENITIES, Landmark, [H]),
      item("amenity-bookings", "Amenity Bookings", ROUTES.BOOKINGS, CalendarDays, [R]),
      item("assigned-bookings", "Assigned Bookings", ROUTES.AMENITY_ASSIGNED, CalendarDays, [M]),
      item("parking", "Parking", ROUTES.PARKING, ParkingCircle, [H, M, R]),
      item("parcels", "Parcels", ROUTES.PARCELS, Package, [H, M, R]),
    ],
  },
  {
    id: "finance", label: "Finance", icon: CircleDollarSign, roles: [H, M, R], children: [
      item("maintenance", "Maintenance", ROUTES.MAINTENANCE, ReceiptText, [H, M]),
      item("maintenance-bills", "Maintenance Bills", ROUTES.MAINTENANCE_BILLS, ReceiptText, [R]),
      item("payments", "Payments", ROUTES.PAYMENTS, CircleDollarSign, [H, M, R]),
      item("reports", "Reports", ROUTES.REPORTS, ScrollText, [H]),
    ],
  },
  {
    id: "community", label: "Community", icon: Megaphone, roles: [H, M, R], children: [
      item("announcements", "Announcements", ROUTES.ANNOUNCEMENTS, Megaphone, [H, M, R]),
      item("events", "Events", ROUTES.EVENTS, CalendarDays, [H, M, R]),
      item("polls", "Polls", ROUTES.POLLS, Vote, [H, M, R]),
      item("documents", "Documents", ROUTES.DOCUMENTS, FileText, [H, M, R]),
    ],
  },

  item("my-profile", "My Profile", ROUTES.PROFILE, Users, [H, M, R]),
  item("my-flat", "My Flat", ROUTES.MY_FLAT, House, [R]),
  item("add-visitor", "Add Visitor", ROUTES.VISITOR_NEW, UserPlus, [G]),
  item("todays-visitors", "Today's Visitors", ROUTES.VISITORS_TODAY, ClipboardCheck, [G]),
  item("visitor-history", "Visitor History", ROUTES.VISITOR_HISTORY, ScrollText, [G]),
  item("guard-parcels", "Parcels", ROUTES.PARCELS, Package, [G]),

  item("notifications", "Notifications", ROUTES.NOTIFICATIONS, Bell, [H, M, R, G]),
  item("preferences", "Settings", ROUTES.SETTINGS, Settings, [H, M, R, G]),
  {
    id: "administration", label: "Administration", icon: Settings, roles: [H], children: [
      item("audit-logs", "Audit Logs", ROUTES.AUDIT_LOGS, ScrollText, [H]),
    ],
  },
]
