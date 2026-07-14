import type { HTMLAttributes, ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  columns?: 1 | 2 | 3
  divider?: boolean
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
} satisfies Record<NonNullable<FormSectionProps["columns"]>, string>

export function FormSection({
  title,
  description,
  icon,
  children,
  columns = 1,
  divider = false,
  className,
  ...props
}: FormSectionProps) {
  return (
    <section className={cn("min-w-0", className)} {...props}>
      <div className="mb-5 flex min-w-0 items-start gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-6 text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>

      <div className={cn("grid min-w-0 gap-5", columnClasses[columns])}>{children}</div>
      {divider ? <Separator className="mt-6" /> : null}
    </section>
  )
}
