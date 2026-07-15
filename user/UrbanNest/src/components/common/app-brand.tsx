import AppLogo from "@/components/common/app-logo"
import { cn } from "@/utils/cn"

interface AppBrandProps {
  showTagline?: boolean
  logoSize?: "sm" | "md" | "lg"
  orientation?: "horizontal" | "vertical"
  className?: string
}

const nameSizeStyles = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
} as const

const taglineSizeStyles = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const

export function AppBrand({
  showTagline = true,
  logoSize = "md",
  orientation = "horizontal",
  className,
}: AppBrandProps) {
  const isVertical = orientation === "vertical"

  return (
    <div
      aria-label="UrbanNest application brand"
      className={cn(
        "inline-flex min-w-0",
        isVertical
          ? "flex-col items-center gap-3 text-center"
          : "items-center gap-3 text-left",
        className
      )}
    >
      <AppLogo size={logoSize} showText={false} />

      <div className={cn("min-w-0", isVertical && "flex flex-col items-center")}>
        <strong
          className={cn(
            "block font-semibold tracking-tight text-foreground",
            nameSizeStyles[logoSize]
          )}
        >
          UrbanNest
        </strong>

        {showTagline ? (
          <p
            className={cn(
              "mt-1 block max-w-full leading-relaxed text-muted-foreground",
              taglineSizeStyles[logoSize]
            )}
          >
            Connected Communities. Simplified Management.
          </p>
        ) : null}
      </div>
    </div>
  )
}
