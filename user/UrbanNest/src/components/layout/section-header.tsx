import type { HTMLAttributes, ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils/cn"

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  divider?: boolean
}

export function SectionHeader({
  title,
  description,
  icon,
  action,
  divider = false,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p className="max-w-3xl break-words text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <div className="flex w-full flex-wrap gap-2 [&>*]:w-full sm:w-auto sm:shrink-0 sm:[&>*]:w-auto">
            {action}
          </div>
        ) : null}
      </div>

      {divider ? <Separator className="mt-4" /> : null}
    </div>
  )
}
