import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface FieldHintProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  variant?: "default" | "error" | "success"
}

const variantClasses = {
  default: "text-muted-foreground",
  error: "font-medium text-destructive",
  success: "font-medium text-emerald-700 dark:text-emerald-400",
} satisfies Record<NonNullable<FieldHintProps["variant"]>, string>

export function FieldHint({ children, variant = "default", className, ...props }: FieldHintProps) {
  return (
    <p
      role={variant === "error" ? "alert" : undefined}
      aria-live="polite"
      className={cn("text-xs leading-5", variantClasses[variant], className)}
      {...props}
    >
      {children}
    </p>
  )
}
