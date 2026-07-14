import { Loader2 } from "lucide-react"

export function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 text-sm text-muted-foreground shadow-lg">
        <Loader2 className="size-4 animate-spin text-primary" />
        Loading interface...
      </div>
    </div>
  )
}