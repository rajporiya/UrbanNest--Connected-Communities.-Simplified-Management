import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/utils/cn"

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: "default" | "wide" | "full"
  spacing?: "compact" | "default" | "comfortable"
}

const sizeStyles = {
  default: "mx-auto max-w-6xl",
  wide: "mx-auto max-w-screen-2xl",
  full: "max-w-none",
} as const

const spacingStyles = {
  compact: "space-y-4 py-4 sm:py-5",
  default: "space-y-6 py-6 sm:py-8",
  comfortable: "space-y-8 py-8 sm:py-10 lg:py-12",
} as const

export function PageContainer({
  children,
  size = "default",
  spacing = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        spacingStyles[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
