import { FilterX } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface TableToolbarProps {
  search?: ReactNode
  filters?: ReactNode
  sort?: ReactNode
  actions?: ReactNode
  activeFilterCount?: number
  onClearFilters?: () => void
  className?: string
}

export function TableToolbar({
  search,
  filters,
  sort,
  actions,
  activeFilterCount = 0,
  onClearFilters,
  className,
}: TableToolbarProps) {
  const showClearFilters = activeFilterCount > 0 && Boolean(onClearFilters)
  const hasRightSection = Boolean(filters || sort || actions || showClearFilters)

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      {search ? <div className="w-full min-w-0 lg:max-w-sm">{search}</div> : null}

      {hasRightSection ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          {filters}
          {sort}
          {showClearFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              aria-label={`Clear ${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"}`}
              className="rounded-lg"
            >
              <FilterX aria-hidden="true" className="size-4" />
              Clear filters ({activeFilterCount})
            </Button>
          ) : null}
          {actions ? (
            <div className="flex min-w-0 flex-wrap gap-2 [&>*]:w-full sm:[&>*]:w-auto">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
