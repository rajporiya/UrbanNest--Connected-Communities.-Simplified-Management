import { CheckCircle2 } from "lucide-react"
import type { ComplaintTimelineEntry } from "@/features/complaints/types/complaint.types"
export function ComplaintTimeline({
  entries,
}: {
  entries: ComplaintTimelineEntry[]
}) {
  return (
    <ol className="space-y-0" aria-label="Complaint timeline">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-background text-primary">
            <CheckCircle2 className="size-4" />
          </div>
          {index < entries.length - 1 && (
            <span className="absolute top-8 left-[15px] h-[calc(100%-2rem)] w-px bg-border" />
          )}
          <div className="min-w-0 pt-0.5">
            <p className="font-medium capitalize">
              {entry.status.replace("-", " ")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {entry.actor} ·{" "}
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(entry.createdAt))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
