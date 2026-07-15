import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { UserAvatar } from "./user-avatar"

export interface AvatarGroupUser {
  id: string
  name: string
  imageUrl?: string | null
}

export interface AvatarGroupProps {
  users: AvatarGroupUser[]
  maxVisible?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const overlapClasses = {
  sm: "-space-x-1.5",
  md: "-space-x-2",
  lg: "-space-x-2.5",
} satisfies Record<NonNullable<AvatarGroupProps["size"]>, string>

const counterSizes = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
} satisfies Record<NonNullable<AvatarGroupProps["size"]>, string>

export function AvatarGroup({ users, maxVisible = 4, size = "md", className }: AvatarGroupProps) {
  const visibleLimit = Math.max(0, Math.floor(maxVisible))
  const visibleUsers = users.slice(0, visibleLimit)
  const remainingCount = Math.max(0, users.length - visibleUsers.length)

  if (users.length === 0) return null

  return (
    <TooltipProvider>
      <div className={cn("flex max-w-full items-center", overlapClasses[size], className)} aria-label={`${users.length} users`}>
        {visibleUsers.map((user, index) => (
          <Tooltip key={`${user.id}-${index}`}>
            <TooltipTrigger
              render={
                <span className="relative inline-flex rounded-full ring-2 ring-background focus-visible:z-10 focus-visible:outline-none focus-visible:ring-ring" />
              }
            >
              <UserAvatar name={user.name} imageUrl={user.imageUrl} size={size} />
            </TooltipTrigger>
            <TooltipContent>{user.name}</TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  className={cn(
                    "relative grid shrink-0 place-items-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background focus-visible:z-10 focus-visible:outline-none focus-visible:ring-ring",
                    counterSizes[size],
                  )}
                />
              }
            >
              +{remainingCount}
            </TooltipTrigger>
            <TooltipContent>{remainingCount} more {remainingCount === 1 ? "user" : "users"}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
