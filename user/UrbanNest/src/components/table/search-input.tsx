import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  disabled?: boolean
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  disabled = false,
  className,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [lastExternalValue, setLastExternalValue] = useState(value)
  const timeoutRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)

  if (value !== lastExternalValue) {
    setLastExternalValue(value)
    setInputValue(value)
  }

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const updateValue = (nextValue: string) => {
    setInputValue(nextValue)
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      onChangeRef.current(nextValue)
      timeoutRef.current = null
    }, Math.max(0, debounceMs))
  }

  const clearSearch = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setInputValue("")
    onChangeRef.current("")
  }

  return (
    <div className={cn("relative w-full min-w-0 sm:max-w-sm", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(event) => updateValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full min-w-0 rounded-lg border border-input bg-background py-2 pl-9 text-sm text-foreground shadow-sm outline-none transition-colors",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          inputValue ? "pr-10" : "pr-3",
          "[&::-webkit-search-cancel-button]:hidden"
        )}
      />
      {inputValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          disabled={disabled}
          onClick={clearSearch}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
