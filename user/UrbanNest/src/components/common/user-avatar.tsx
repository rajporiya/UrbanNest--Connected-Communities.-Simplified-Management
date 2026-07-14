import { useState } from "react"

import { cn } from "@/lib/utils"
import { getInitials } from "@/utils/get-initials"

export interface UserAvatarProps {
  name: string
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  status?: "online" | "offline" | "busy" | "away"
  showStatus?: boolean
  className?: string
}

const avatarSizes = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-lg",
} satisfies Record<NonNullable<UserAvatarProps["size"]>, string>

const statusSizes = {
  sm: "size-2 border",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "size-4 border-2",
} satisfies Record<NonNullable<UserAvatarProps["size"]>, string>

const statusClasses = {
  online: "bg-emerald-500",
  offline: "bg-muted-foreground",
  busy: "bg-destructive",
  away: "bg-amber-500",
} satisfies Record<NonNullable<UserAvatarProps["status"]>, string>

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return getInitials(parts[0], parts.length > 1 ? parts.at(-1) : undefined)
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  status = "offline",
  showStatus = false,
  className,
}: UserAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const hasUsableImage = Boolean(imageUrl) && failedImageUrl !== imageUrl
  const readableName = name.trim() || "UrbanNest user"

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-label={showStatus ? `${readableName}, ${status}` : undefined}
    >
      <span
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border",
          avatarSizes[size],
        )}
      >
        <span aria-hidden={hasUsableImage}>{initialsFromName(name)}</span>
        {hasUsableImage ? (
          <img
            src={imageUrl ?? undefined}
            alt={`${readableName}'s profile photo`}
            className="absolute inset-0 size-full object-cover"
            onError={() => setFailedImageUrl(imageUrl ?? null)}
          />
        ) : null}
      </span>
      {showStatus ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-0 bottom-0 rounded-full border-background",
              statusSizes[size],
              statusClasses[status],
            )}
          />
          <span className="sr-only">Status: {status}</span>
        </>
      ) : null}
    </span>
  )
}
