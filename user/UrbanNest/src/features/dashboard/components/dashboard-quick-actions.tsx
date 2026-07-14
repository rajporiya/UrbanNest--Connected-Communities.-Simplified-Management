import { Link } from "react-router-dom"
import type { UserRole } from "@/constants/roles.constants"
import type { DashboardQuickAction } from "@/features/dashboard/types/dashboard.types"

export interface DashboardQuickActionsProps { actions: DashboardQuickAction[]; currentRole: UserRole }
export function DashboardQuickActions({ actions, currentRole }: DashboardQuickActionsProps) {
  const visible = actions.filter((action) => action.roles.includes(currentRole))
  return <div className="grid gap-3 sm:grid-cols-2">{visible.map((action) => <Link key={action.id} to={action.href} className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">{action.icon}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{action.label}</span>{action.description ? <span className="block truncate text-xs text-muted-foreground">{action.description}</span> : null}</span></Link>)}</div>
}
