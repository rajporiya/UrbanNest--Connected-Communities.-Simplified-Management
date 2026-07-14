import type { ReactNode } from "react"

import { cn } from "@/utils/cn"

interface PageHeaderProps {
  title: string
  description?: string
  badge?: ReactNode
  icon?: ReactNode
  breadcrumbs?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  badge,
  icon,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("min-w-0 space-y-4", className)}>
      {breadcrumbs ? (
        <nav aria-label="Breadcrumb" className="min-w-0 overflow-hidden text-sm text-muted-foreground">
          {breadcrumbs}
        </nav>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {icon ? (
            <div
              aria-hidden="true"
              className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:size-11"
            >
              {icon}
            </div>
          ) : null}

          <div className="min-w-0 space-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {badge}
            </div>

            {description ? (
              <p className="max-w-3xl break-words text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full min-w-0 flex-wrap gap-2 [&>*]:w-full sm:[&>*]:w-auto md:w-auto md:shrink-0 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
