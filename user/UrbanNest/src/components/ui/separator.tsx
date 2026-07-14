import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 bg-border", className)}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  )
}