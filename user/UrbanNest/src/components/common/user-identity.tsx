import type { ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { UserAvatar } from "./user-avatar"

export interface UserIdentityProps {
  name: string
  imageUrl?: string | null
  primaryText?: string
  secondaryText?: string
  badge?: ReactNode
  avatarSize?: "sm" | "md" | "lg"
  orientation?: "horizontal" | "vertical"
  className?: string
}

function TruncatedText({ children, className }: { children: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("block max-w-full truncate", className)} />}>{children}</TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}

export function UserIdentity({
  name,
  imageUrl,
  primaryText,
  secondaryText,
  badge,
  avatarSize = "md",
  orientation = "horizontal",
  className,
}: UserIdentityProps) {
  const vertical = orientation === "vertical"

  return (
    <TooltipProvider>
      <article
        className={cn(
          "flex min-w-0 max-w-full",
          vertical ? "flex-col items-center gap-2 text-center" : "items-center gap-3 text-left",
          className,
        )}
      >
        <UserAvatar name={name} imageUrl={imageUrl} size={avatarSize} />
        <div className={cn("min-w-0 max-w-full", vertical && "w-full")}>
          <div className={cn("flex min-w-0 items-center gap-2", vertical && "justify-center")}>
            <TruncatedText className="font-semibold text-foreground">{name}</TruncatedText>
            {badge ? <span className="shrink-0">{badge}</span> : null}
          </div>
          {primaryText ? (
            <TruncatedText className="mt-0.5 text-sm text-muted-foreground">{primaryText}</TruncatedText>
          ) : null}
          {secondaryText ? (
            <TruncatedText className="mt-0.5 text-xs text-muted-foreground">{secondaryText}</TruncatedText>
          ) : null}
        </div>
      </article>
    </TooltipProvider>
  )
}
