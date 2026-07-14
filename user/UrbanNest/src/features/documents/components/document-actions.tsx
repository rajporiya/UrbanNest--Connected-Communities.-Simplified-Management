import { Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SocietyDocument } from "@/features/documents/types/document.types"

export interface DocumentActionsProps { document: SocietyDocument; compact?: boolean; onPreview: (document: SocietyDocument) => void; onDownload: (document: SocietyDocument) => void }
export function DocumentActions({ document, compact = false, onPreview, onDownload }: DocumentActionsProps) {
  return <div className="flex justify-end gap-1"><Button type="button" size={compact ? "icon-xs" : "sm"} variant="ghost" aria-label={`Preview ${document.title}`} onClick={() => onPreview(document)}><Eye />{compact ? null : "Preview"}</Button><Button type="button" size={compact ? "icon-xs" : "sm"} variant="ghost" aria-label={`Download ${document.title}`} onClick={() => onDownload(document)}><Download />{compact ? null : "Download"}</Button></div>
}
