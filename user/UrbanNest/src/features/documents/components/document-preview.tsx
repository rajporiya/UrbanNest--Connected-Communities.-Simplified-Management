import { Download, FileText, X } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import type { SocietyDocument } from "@/features/documents/types/document.types"

export interface DocumentPreviewProps { document: SocietyDocument | null; open: boolean; onOpenChange: (open: boolean) => void; onDownload: (document: SocietyDocument) => void }
export function DocumentPreview({ document, open, onOpenChange, onDownload }: DocumentPreviewProps) {
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key === "Escape") onOpenChange(false) }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close) }, [open, onOpenChange])
  if (!open || !document) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onOpenChange(false) }}>
    <section role="dialog" aria-modal="true" aria-labelledby="document-preview-title" className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5"><div className="min-w-0"><h2 id="document-preview-title" className="truncate text-lg font-semibold">{document.title}</h2><p className="mt-1 text-sm text-muted-foreground">PDF preview · Version {document.version} · {document.fileSize}</p></div><Button variant="ghost" size="icon-sm" aria-label="Close preview" onClick={() => onOpenChange(false)}><X /></Button></header>
      <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4 sm:p-8">
        <div className="mx-auto min-h-[32rem] max-w-2xl rounded-sm bg-white p-8 text-slate-900 shadow-lg sm:p-12"><div className="flex items-center gap-3 border-b border-slate-200 pb-6"><div className="grid size-12 place-items-center rounded-xl bg-slate-100"><FileText className="size-6 text-slate-700" /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">UrbanNest Document Center</p><h3 className="mt-1 text-xl font-bold">{document.title}</h3></div></div><p className="mt-8 leading-7 text-slate-700">{document.description}</p><div className="mt-10 space-y-3 text-sm text-slate-600"><p><strong>Category:</strong> {document.category}</p><p><strong>Published by:</strong> {document.uploadedBy}</p><p><strong>Version:</strong> {document.version}</p></div><p className="mt-14 border-t border-slate-200 pt-5 text-xs text-slate-500">This is a safe interface preview. Download the source document to view its complete contents.</p></div>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button onClick={() => onDownload(document)}><Download />Download document</Button></footer>
    </section>
  </div>
}
