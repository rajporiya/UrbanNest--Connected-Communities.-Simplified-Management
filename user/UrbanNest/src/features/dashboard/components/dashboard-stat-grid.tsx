import { StatCard } from "@/components/common/stat-card"
import { cn } from "@/lib/utils"
import type { DashboardStatItem } from "@/features/dashboard/types/dashboard.types"

export interface DashboardStatGridProps { items: DashboardStatItem[]; loading?: boolean; className?: string }
export function DashboardStatGrid({ items, loading = false, className }: DashboardStatGridProps) {
  const rendered = loading && items.length === 0 ? Array.from({ length: 6 }, (_, index) => ({ id: `loading-${index}`, label: "", value: "", icon: null })) : items
  return <section aria-label="Dashboard statistics" className={cn("grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>{rendered.map((item) => <StatCard key={item.id} {...item} loading={loading} />)}</section>
}
