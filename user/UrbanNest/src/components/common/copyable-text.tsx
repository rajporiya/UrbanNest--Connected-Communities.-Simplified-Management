import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface CopyableTextProps {
  value: string
  displayValue?: string
  successMessage?: string
  className?: string
}

export function CopyableText({
  value,
  displayValue,
  successMessage = "Copied to clipboard",
  className,
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disabled = value.length === 0

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }, [])

  const handleCopy = async () => {
    if (disabled) return
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable")
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(successMessage)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to clipboard. Please try again.")
    }
  }

  const tooltipLabel = copied ? "Copied" : "Copy"

  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5", className)}>
      <span className="min-w-0 truncate" title={displayValue ?? value}>{displayValue ?? value}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                aria-label={tooltipLabel}
                onClick={() => void handleCopy()}
                className="shrink-0 rounded-md"
              />
            }
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
}
