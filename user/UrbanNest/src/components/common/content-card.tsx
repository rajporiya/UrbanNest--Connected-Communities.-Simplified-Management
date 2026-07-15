import type { HTMLAttributes, ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/utils/cn"

interface ContentCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: ReactNode
  headerAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
  compact?: boolean
  loading?: boolean
}

function ContentCardSkeleton({ compact }: { compact: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn("animate-pulse space-y-5", compact ? "p-4" : "p-6")}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/5 rounded-md bg-muted" />
          <div className="h-3 w-3/5 rounded-md bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded-md bg-muted" />
        <div className="h-4 w-11/12 rounded-md bg-muted" />
        <div className="h-4 w-4/5 rounded-md bg-muted" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function ContentCard({
  title,
  description,
  icon,
  headerAction,
  footer,
  children,
  compact = false,
  loading = false,
  className,
  ...props
}: ContentCardProps) {
  const hasHeader = Boolean(title || description || icon || headerAction)

  return (
    <Card
      className={cn(
        "min-w-0 rounded-xl border-border/80 shadow-sm",
        className
      )}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <ContentCardSkeleton compact={compact} />
      ) : (
        <>
          {hasHeader ? (
            <CardHeader
              className={cn(
                "flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between",
                compact ? "p-4" : "p-6"
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                {icon ? (
                  <div
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    {icon}
                  </div>
                ) : null}
                <div className="min-w-0 space-y-1.5">
                  {title ? <CardTitle className="break-words">{title}</CardTitle> : null}
                  {description ? (
                    <CardDescription className="break-words leading-6">
                      {description}
                    </CardDescription>
                  ) : null}
                </div>
              </div>
              {headerAction ? (
                <div className="flex w-full flex-wrap gap-2 [&>*]:w-full sm:w-auto sm:shrink-0 sm:[&>*]:w-auto">
                  {headerAction}
                </div>
              ) : null}
            </CardHeader>
          ) : null}

          <CardContent
            className={cn(
              "min-w-0",
              compact ? "p-4" : "p-6",
              hasHeader && "pt-0"
            )}
          >
            {children}
          </CardContent>

          {footer ? (
            <CardFooter className={cn("flex-wrap gap-2", compact ? "p-4 pt-0" : "p-6 pt-0")}>
              {footer}
            </CardFooter>
          ) : null}
        </>
      )}
    </Card>
  )
}
