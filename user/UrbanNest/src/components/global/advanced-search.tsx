import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AdvancedSearch({
  value,
  onChange,
  placeholder = "Search records...",
  suggestions = [],
  onSelect,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  onSelect?: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search
        aria-hidden="true"
        className="absolute top-3 left-3 size-4 text-muted-foreground"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border bg-background pr-9 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1.5 right-1.5"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
      {value && suggestions.length ? (
        <ul className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onSelect?.(suggestion)}
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
