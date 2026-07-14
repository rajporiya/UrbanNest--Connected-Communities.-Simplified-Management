import { Badge } from "@/components/ui/badge"
import { ContentCard } from "@/components/common/content-card"
import { dashboardQuickActions } from "@/features/dashboard/data/dashboard.mock"
import type { DashboardActivity, DashboardStatItem, RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"
import type { UserRole } from "@/constants/roles.constants"
import { Bell, CalendarDays, Car, CircleDollarSign, ClipboardCheck, Package, ReceiptText, ShieldCheck, Siren, UserCheck, Users, Wrench } from "lucide-react"
import { ComplaintStatusChart } from "./complaint-status-chart"
import { DashboardQuickActions } from "./dashboard-quick-actions"
import { DashboardStatGrid } from "./dashboard-stat-grid"
import { RecentActivityList } from "./recent-activity-list"
import { RevenueOverviewChart } from "./revenue-overview-chart"
import { VisitorActivityChart } from "./visitor-activity-chart"

const icons = { users: Users, shield: ShieldCheck, guard: UserCheck, visitors: UserCheck, complaints: Wrench, bills: ReceiptText, revenue: CircleDollarSign, bookings: CalendarDays, progress: ClipboardCheck, resolved: ShieldCheck, tasks: ClipboardCheck, events: CalendarDays, notifications: Bell, vehicles: Car, alerts: Siren, parcels: Package } as const
export function RoleDashboardContent({ data, role, loading = false }: { data: RoleDashboardResponse; role: UserRole; loading?: boolean }) {
  const stats: DashboardStatItem[] = data.stats.map((item) => { const Icon = icons[item.icon as keyof typeof icons] ?? ClipboardCheck; return { ...item, icon: <Icon aria-hidden="true" /> } })
  const activities: DashboardActivity[] = data.activities.map((activity) => ({ ...activity, status: activity.statusLabel ? <Badge variant="secondary">{activity.statusLabel}</Badge> : undefined }))
  return <div className="space-y-6"><DashboardStatGrid items={stats} loading={loading} /><div className="grid gap-6 xl:grid-cols-2">{data.revenue ? <RevenueOverviewChart data={data.revenue} loading={loading} /> : null}{data.complaints ? <ComplaintStatusChart data={data.complaints} loading={loading} /> : null}{data.visitors ? <VisitorActivityChart data={data.visitors} loading={loading} /> : null}<ContentCard title="Recent activity" description="Latest updates from your workspace"><RecentActivityList activities={activities} loading={loading} /></ContentCard></div><div className="grid gap-6 xl:grid-cols-2"><ContentCard title="Overview" description="Items that need your attention"><ul className="space-y-3">{data.highlights.map((highlight) => <li key={highlight} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"><ClipboardCheck aria-hidden="true" className="size-4 text-primary" />{highlight}</li>)}</ul></ContentCard><ContentCard title="Quick actions" description="Frequently used tasks"><DashboardQuickActions actions={dashboardQuickActions} currentRole={role} /></ContentCard></div></div>
}
