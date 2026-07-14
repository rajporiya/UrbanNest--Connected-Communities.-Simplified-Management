import { ArrowUpDown } from "lucide-react"

import { cn } from "@/utils/cn"

interface SortOption {
  label: string
  value: string
}

interface SortSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SortOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SortSelect({
  value,
  onValueChange,
  options,
  placeholder = "Sort by",
  disabled = false,
  className,
}: SortSelectProps) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <ArrowUpDown
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          "h-10 w-full min-w-40 appearance-none rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-sm text-foreground shadow-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-15px)_50%,calc(100%-10px)_50%] bg-no-repeat"
        )}
      >
        {!value ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
