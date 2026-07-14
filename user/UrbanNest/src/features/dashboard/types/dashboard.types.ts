import type { ReactNode } from "react"
import type { UserRole } from "@/constants/roles.constants"

export interface DashboardStatItem { id: string; label: string; value: string | number; icon: ReactNode; description?: string; trend?: { value: number; direction: "up" | "down" | "neutral"; label?: string } }
export interface DashboardStatData extends Omit<DashboardStatItem, "icon"> { icon: string }
export interface DashboardActivity { id: string; title: string; description?: string; timestamp: string; icon?: ReactNode; status?: ReactNode; href?: string }
export interface DashboardActivityData extends Omit<DashboardActivity, "icon" | "status"> { statusLabel?: string }
export interface DashboardQuickAction { id: string; label: string; description?: string; icon: ReactNode; href: string; roles: UserRole[] }
export interface RevenueChartPoint { month: string; collected: number; pending: number }
export interface ComplaintStatusPoint { status: string; value: number }
export interface VisitorActivityPoint { day: string; expected: number; checkedIn: number }
export interface RoleDashboardResponse { role: UserRole; stats: DashboardStatData[]; activities: DashboardActivityData[]; revenue?: RevenueChartPoint[]; complaints?: ComplaintStatusPoint[]; visitors?: VisitorActivityPoint[]; highlights: string[] }
