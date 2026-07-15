import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"
export interface BookingCalendarProps {
  value: string
  onChange: (value: string) => void
  month: Date
  onMonthChange: (month: Date) => void
  bookedDates?: string[]
}
const iso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
export function BookingCalendar({
  value,
  onChange,
  month,
  onMonthChange,
  bookedDates = [],
}: BookingCalendarProps) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: count },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)
    ),
  ]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    <section
      aria-label="Booking date calendar"
      className="max-w-md w-full rounded-xl border bg-background p-3 sm:p-4 shadow-sm"
    >
      <header className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Previous month"
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() - 1, 1)
            )
          }
        >
          <ChevronLeft />
        </Button>
        <h3 className="font-semibold">
          {new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric",
          }).format(month)}
        </h3>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Next month"
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() + 1, 1)
            )
          }
        >
          <ChevronRight />
        </Button>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className="py-1 font-medium">
            {day}
          </span>
        ))}
        {cells.map((date, index) =>
          date ? (
            <button
              key={iso(date)}
              type="button"
              disabled={date < today}
              onClick={() => onChange(iso(date))}
              aria-pressed={value === iso(date)}
              className={cn(
                "relative aspect-square rounded-full text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-30",
                value === iso(date) &&
                  "bg-primary text-primary-foreground hover:bg-primary",
                iso(date) === iso(today) &&
                  value !== iso(date) &&
                  "font-bold text-primary"
              )}
            >
              {date.getDate()}
              {bookedDates.includes(iso(date)) && (
                <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current" />
              )}
            </button>
          ) : (
            <span key={`blank-${index}`} />
          )
        )}
      </div>
    </section>
  )
}
