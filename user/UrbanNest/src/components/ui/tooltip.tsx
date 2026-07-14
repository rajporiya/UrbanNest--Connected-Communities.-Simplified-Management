/* eslint-disable react-refresh/only-export-components */
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import type { ComponentProps } from "react"
import { cn } from "@/utils/cn"

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({ className, sideOffset = 8, ...props }: ComponentProps<typeof TooltipPrimitive.Popup> & { sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          className={cn("z-50 rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg", className)}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}
