import { CalendarDays } from "lucide-react"

import type {
  ReportCategory,
  ReportQuery,
} from "@/features/reports/types/report.types"
import { cn } from "@/lib/utils"

const categories: Array<{ value: ReportCategory; label: string }> = [
  { value: "users", label: "Users" },
  { value: "payments", label: "Payments" },
  { value: "complaints", label: "Complaints" },
  { value: "visitors", label: "Visitors" },
  { value: "amenities", label: "Amenities" },
  { value: "security", label: "Security" },
]

interface ReportFiltersProps {
  value: ReportQuery
  onChange: (query: ReportQuery) => void
}

export function ReportFilters({ value, onChange }: ReportFiltersProps) {
  const inputClass =
    "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Report category"
      >
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            role="tab"
            aria-selected={value.category === category.value}
            onClick={() => onChange({ ...value, category: category.value })}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              value.category === category.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="space-y-1 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <CalendarDays className="size-4" />
            From
          </span>
          <input
            type="date"
            value={value.from ?? ""}
            onChange={(event) =>
              onChange({ ...value, from: event.target.value || undefined })
            }
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">To</span>
          <input
            type="date"
            value={value.to ?? ""}
            onChange={(event) =>
              onChange({ ...value, to: event.target.value || undefined })
            }
            className={inputClass}
          />
        </label>
      </div>
    </div>
  )
}
