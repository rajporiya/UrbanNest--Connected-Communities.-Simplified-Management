import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  align?: "start" | "end" | "between"
  sticky?: boolean
}

const alignmentClasses = {
  start: "sm:justify-start",
  end: "sm:justify-end",
  between: "sm:justify-between",
} satisfies Record<NonNullable<FormActionsProps["align"]>, string>

export function FormActions({
  children,
  align = "end",
  sticky = false,
  className,
  ...props
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col-reverse gap-2 py-4 sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto",
        alignmentClasses[align],
        sticky && "sticky bottom-0 z-20 border-t border-border bg-background/95 px-4 shadow-[0_-6px_16px_-12px_rgb(0_0_0/0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
