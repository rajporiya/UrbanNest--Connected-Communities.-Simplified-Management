import { cn } from "@/lib/utils"

export interface CharacterCounterProps {
  current: number
  max: number
  warningThreshold?: number
  className?: string
}

export function CharacterCounter({
  current,
  max,
  warningThreshold = 0.8,
  className,
}: CharacterCounterProps) {
  const safeCurrent = Number.isFinite(current) ? Math.max(0, Math.floor(current)) : 0
  const safeMax = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0
  const safeThreshold = Number.isFinite(warningThreshold)
    ? Math.min(1, Math.max(0, warningThreshold))
    : 0.8
  const isOverLimit = safeMax === 0 ? safeCurrent > 0 : safeCurrent > safeMax
  const isWarning = !isOverLimit && safeMax > 0 && safeCurrent >= safeMax * safeThreshold
  const remaining = Math.max(0, safeMax - safeCurrent)

  const accessibleStatus = safeMax === 0
    ? "Character limit unavailable"
    : isOverLimit
      ? `${safeCurrent - safeMax} characters over the limit`
      : `${remaining} characters remaining`

  return (
    <p
      aria-live="polite"
      className={cn(
        "text-right text-xs tabular-nums text-muted-foreground",
        isWarning && "font-medium text-amber-700 dark:text-amber-400",
        isOverLimit && "font-semibold text-destructive",
        className,
      )}
    >
      <span aria-hidden="true">{safeCurrent} / {safeMax}</span>
      {isWarning ? <span aria-hidden="true"> · Near limit</span> : null}
      {isOverLimit ? <span aria-hidden="true"> · Limit exceeded</span> : null}
      <span className="sr-only">. {accessibleStatus}</span>
    </p>
  )
}
