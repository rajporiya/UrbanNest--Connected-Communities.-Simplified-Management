import type { ReactNode } from "react"

import { cn } from "@/utils/cn"

interface FilterOption {
  label: string
  value: string
}

interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
  allLabel?: string
  allValue?: string
  icon?: ReactNode
  disabled?: boolean
  className?: string
}

export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder = "Filter",
  allLabel = "All",
  allValue = "all",
  icon,
  disabled = false,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("relative min-w-0", className)}>
      {icon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          "h-10 w-full min-w-36 appearance-none rounded-lg border border-input bg-background py-2 pr-9 text-sm text-foreground shadow-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          icon ? "pl-9" : "pl-3",
          "bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-15px)_50%,calc(100%-10px)_50%] bg-no-repeat"
        )}
      >
        <option value={allValue}>{allLabel}</option>
        {options.filter((option) => option.value !== allValue).map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
