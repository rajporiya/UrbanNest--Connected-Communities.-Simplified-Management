import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PdfPreview({
  url,
  title = "Document preview",
  className,
}: {
  url?: string
  title?: string
  className?: string
}) {
  return (
    <section
      aria-label={title}
      className={cn("overflow-hidden rounded-xl border bg-card", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b p-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <FileText aria-hidden="true" className="size-4 text-primary" />
          <span className="truncate">{title}</span>
        </span>
        {url ? (
          <Button
            variant="outline"
            size="sm"
            render={<a href={url} download />}
          >
            <Download aria-hidden="true" />
            Download
          </Button>
        ) : null}
      </div>
      {url ? (
        <iframe
          title={title}
          src={url}
          className="h-[60vh] min-h-80 w-full bg-muted"
        />
      ) : (
        <div className="grid min-h-72 place-items-center p-6 text-center text-sm text-muted-foreground">
          PDF preview is unavailable.
        </div>
      )}
    </section>
  )
}
