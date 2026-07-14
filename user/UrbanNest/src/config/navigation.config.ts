import { Building2, Gauge, Home, ShieldCheck, Users } from "lucide-react"
import { ROUTES } from "@/constants/routes.constants"
import type { NavigationItem } from "@/types/navigation.types"

export const primaryNavigation: NavigationItem[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: Gauge },
  { label: "Residents", href: "/dashboard/residents", icon: Users },
  { label: "Committee", href: "/dashboard/committee", icon: ShieldCheck },
  { label: "Towers & Flats", href: "/dashboard/properties", icon: Building2 },
]
