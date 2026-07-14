import type { LabelHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface RequiredLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  required?: boolean
  optionalText?: string
}

export function RequiredLabel({
  children,
  required = false,
  optionalText = "Optional",
  className,
  ...props
}: RequiredLabelProps) {
  return (
    <label className={cn("flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-sm font-medium text-foreground", className)} {...props}>
      <span>{children}</span>
      {required ? (
        <span className="font-semibold text-destructive">
          <span aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </span>
      ) : optionalText ? (
        <span className="text-xs font-normal text-muted-foreground">({optionalText})</span>
      ) : null}
    </label>
  )
}
