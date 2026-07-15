import { Building2 } from "lucide-react"

import { cn } from "@/utils/cn"

interface AppLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const sizeStyles = {
  sm: {
    container: "gap-2",
    iconWrapper: "size-9 rounded-xl",
    icon: "size-6",
    name: "text-sm",
    tagline: "text-[0.625rem]",
  },
  md: {
    container: "gap-3",
    iconWrapper: "size-11 rounded-xl",
    icon: "size-8",
    name: "text-base",
    tagline: "text-xs",
  },
  lg: {
    container: "gap-3.5",
    iconWrapper: "size-14 rounded-xl",
    icon: "size-[42px]",
    name: "text-xl",
    tagline: "text-sm",
  },
} as const

export default function AppLogo({
  size = "md",
  showText = true,
  className,
}: AppLogoProps) {
  const styles = sizeStyles[size]

  return (
    <div
      role="img"
      aria-label="UrbanNest"
      className={cn("inline-flex min-w-0 items-center", styles.container, className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center bg-primary text-primary-foreground",
          "shadow-md shadow-primary/20 dark:shadow-primary/10",
          styles.iconWrapper
        )}
      >
        <Building2 className={styles.icon} strokeWidth={1.9} />
      </span>

      {showText ? (
        <span className="min-w-0 leading-none">
          <span className={cn("block truncate font-semibold tracking-tight text-foreground", styles.name)}>
            UrbanNest
          </span>
          <span className={cn("mt-1 block truncate text-muted-foreground", styles.tagline)}>
            Connected Communities. Simplified Management.
          </span>
        </span>
      ) : null}
    </div>
  )
}
