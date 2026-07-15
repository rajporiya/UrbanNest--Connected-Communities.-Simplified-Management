import type { ReactNode } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp?: string
  complete?: boolean
  icon?: ReactNode
}
export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[]
  className?: string
}) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-7 bottom-0 left-3 w-px bg-border"
            />
          ) : null}
          <span
            className={cn(
              "relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-background",
              item.complete ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            {item.icon ??
              (item.complete ? (
                <CheckCircle2 aria-hidden="true" className="size-5" />
              ) : (
                <Circle aria-hidden="true" className="size-4" />
              ))}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.timestamp ? (
                <time className="text-xs text-muted-foreground">
                  {item.timestamp}
                </time>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
