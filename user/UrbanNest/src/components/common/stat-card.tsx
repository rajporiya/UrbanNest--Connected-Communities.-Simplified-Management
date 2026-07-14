import { motion, useReducedMotion } from "framer-motion"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/utils/cn"

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
    label?: string
  }
  loading?: boolean
  className?: string
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    label: "Increased",
    className: "text-emerald-700 dark:text-emerald-300",
  },
  down: {
    icon: TrendingDown,
    label: "Decreased",
    className: "text-red-700 dark:text-red-300",
  },
  neutral: {
    icon: Minus,
    label: "No change",
    className: "text-muted-foreground",
  },
} as const

function StatCardSkeleton() {
  return (
    <div role="status" aria-label="Loading statistic" className="animate-pulse space-y-5 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-4">
        <div className="h-4 w-2/5 rounded-md bg-muted" />
        <div className="size-10 rounded-xl bg-muted" />
      </div>
      <div className="h-8 w-3/5 rounded-md bg-muted" />
      <div className="h-3 w-1/2 rounded-md bg-muted" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  description,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  const reduceMotion = useReducedMotion()
  const trendDetails = trend ? trendConfig[trend.direction] : null
  const TrendIcon = trendDetails?.icon

  return (
    <motion.div
      className="min-w-0"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Card className={cn("h-full min-w-0 rounded-xl border-border/80 shadow-sm transition-shadow hover:shadow-md", className)}>
        <CardContent className="p-5 sm:p-6" aria-busy={loading}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <div className="min-w-0 space-y-4">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <p className="min-w-0 break-words text-sm font-medium text-muted-foreground">{label}</p>
                {icon ? (
                  <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
                    {icon}
                  </div>
                ) : null}
              </div>

              <p className="min-w-0 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {value}
              </p>

              {description || (trend && trendDetails && TrendIcon) ? (
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  {trend && trendDetails && TrendIcon ? (
                    <span className={cn("inline-flex items-center gap-1 font-medium", trendDetails.className)}>
                      <TrendIcon aria-hidden="true" className="size-3.5" />
                      <span>{trendDetails.label} {Math.abs(trend.value)}%</span>
                    </span>
                  ) : null}
                  {trend?.label ? <span className="text-muted-foreground">{trend.label}</span> : null}
                  {description ? <span className="basis-full break-words text-muted-foreground">{description}</span> : null}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
