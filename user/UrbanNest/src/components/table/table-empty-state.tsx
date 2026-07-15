import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface TableEmptyStateProps {
  colSpan: number
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function TableEmptyState({
  colSpan,
  title = "No results found",
  description = "Try adjusting your search or filters.",
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={Math.max(1, colSpan)} className={cn("px-4 py-14 text-center", className)}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
      </td>
    </tr>
  )
}
