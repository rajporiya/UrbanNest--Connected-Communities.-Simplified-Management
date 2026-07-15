import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  label?: string
  fullScreen?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
} satisfies Record<NonNullable<LoadingStateProps["size"]>, string>

export function LoadingState({
  label = "Loading...",
  fullScreen = false,
  size = "md",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 text-muted-foreground",
        fullScreen ? "min-h-svh w-full flex-col px-4 text-center" : "inline-flex",
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className={cn("shrink-0 animate-spin text-primary motion-reduce:animate-none", sizeClasses[size])}
      />
      <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>
    </div>
  )
}
