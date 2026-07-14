import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  Gauge,
  Landmark,
  MailWarning,
  ParkingCircle,
  Receipt,
  ShieldCheck,
  type LucideIcon,
  Users,
  PlugZap,
} from "lucide-react"

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const appConfig = {
  name: "UrbanNest",
  subtitle: "Society Management System",
}

export const sidebarNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Residents", href: "/dashboard/residents", icon: Users },
  { label: "Committee", href: "/dashboard/committee", icon: ShieldCheck },
  { label: "Visitors", href: "/dashboard/visitors", icon: Building2 },
  { label: "Complaints", href: "/dashboard/complaints", icon: MailWarning },
  { label: "Amenities", href: "/dashboard/amenities", icon: PlugZap },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: ClipboardList },
  { label: "Payments", href: "/dashboard/payments", icon: Receipt },
  { label: "Parking", href: "/dashboard/parking", icon: ParkingCircle },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
  { label: "Reports", href: "/dashboard/reports", icon: Landmark },
  { label: "Settings", href: "/dashboard/settings", icon: Bell },
]