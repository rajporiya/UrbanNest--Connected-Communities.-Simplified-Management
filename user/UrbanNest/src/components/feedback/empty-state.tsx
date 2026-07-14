import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  title = "No data available",
  description = "There is currently nothing to display.",
  icon,
  primaryAction,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center text-center",
        compact ? "gap-2 px-2 py-4" : "gap-3 px-4 py-8 sm:px-8 sm:py-12",
      )}
    >
      {icon ? (
        <div aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-6">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 max-w-lg">
        <h2 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {primaryAction || secondaryAction ? (
        <div className="mt-2 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-center">
          {secondaryAction}
          {primaryAction}
        </div>
      ) : null}
    </div>
  )

  if (compact) return <section className={cn("w-full", className)}>{content}</section>

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  )
}
