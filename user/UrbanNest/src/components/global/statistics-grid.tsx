import type { ComponentProps } from "react"
import { StatCard } from "@/components/common/stat-card"
import { cn } from "@/lib/utils"
export function StatisticsGrid({
  items,
  className,
}: {
  items: Array<ComponentProps<typeof StatCard> & { id: string }>
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map(({ id, ...item }) => (
        <StatCard key={id} {...item} />
      ))}
    </div>
  )
}
