import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/utils/cn"

interface PageActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  align?: "start" | "end" | "between"
  mobileStack?: boolean
}

const alignmentStyles = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
} as const

export function PageActions({
  children,
  align = "end",
  mobileStack = true,
  className,
  ...props
}: PageActionsProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-2",
        mobileStack
          ? "flex-col [&>*]:w-full sm:flex-row sm:flex-wrap sm:[&>*]:w-auto"
          : "flex-row flex-wrap",
        alignmentStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
