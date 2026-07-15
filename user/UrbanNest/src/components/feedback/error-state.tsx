import { useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { LoaderCircle, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  description?: string
  errorCode?: string | number
  onRetry?: () => void | Promise<void>
  retryLabel?: string
  backAction?: ReactNode
  compact?: boolean
  className?: string
  /** @deprecated Use errorCode. Retained for existing error pages. */
  code?: string | number
  /** @deprecated ErrorState always uses TriangleAlert. Retained for existing error pages. */
  icon?: LucideIcon
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not complete your request.",
  errorCode,
  onRetry,
  retryLabel = "Try again",
  backAction,
  compact = false,
  className,
  code,
  icon: Icon = TriangleAlert,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const displayedCode = errorCode ?? code

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const content = (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex min-w-0 flex-col items-center text-center",
        compact ? "gap-2 px-2 py-4" : "gap-4 px-4 py-8 sm:px-8 sm:py-12",
      )}
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <div className="min-w-0 max-w-lg">
        {displayedCode !== undefined ? (
          <p className="mb-1 text-xs font-semibold tracking-wide text-destructive uppercase">Error {displayedCode}</p>
        ) : null}
        <h2 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {onRetry || backAction ? (
        <div className="mt-1 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-center">
          {backAction}
          {onRetry ? (
            <Button type="button" onClick={() => void handleRetry()} disabled={isRetrying} aria-busy={isRetrying}>
              {isRetrying ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
              {isRetrying ? "Retrying..." : retryLabel}
            </Button>
          ) : null}
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
