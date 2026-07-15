import { Download, File, FileText, FolderOpen } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { RootState } from "@/app/root-reducer"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar, type DataTableColumn } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { DocumentActions } from "@/features/documents/components/document-actions"
import { DocumentPreview } from "@/features/documents/components/document-preview"
import { fetchDocuments, recordDocumentDownload, type DocumentsState } from "@/features/documents/store/documents.slice"
import type { DocumentCategory, DocumentFileType, DocumentListQuery, DocumentSort, SocietyDocument } from "@/features/documents/types/document.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { documents: DocumentsState }
const categoryOptions = [{ label: "Society Rules", value: "rules" }, { label: "Meeting Minutes", value: "minutes" }, { label: "Circulars", value: "circulars" }, { label: "Forms", value: "forms" }, { label: "NOC", value: "noc" }]
const fileOptions = [{ label: "PDF", value: "pdf" }, { label: "Word", value: "docx" }, { label: "Excel", value: "xlsx" }]
const sortOptions = [{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }, { label: "Title A–Z", value: "title_asc" }, { label: "Most downloaded", value: "downloads_desc" }]
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))

export function DocumentsPage() {
  const dispatch = useAppDispatch(); const [params, setParams] = useSearchParams(); const state = useAppSelector((root) => (root as State).documents); const [preview, setPreview] = useState<SocietyDocument | null>(null)
  const page = Math.max(1, Number(params.get("page")) || 1); const limit = Math.max(1, Number(params.get("limit")) || 10); const search = params.get("search") ?? ""; const category = params.get("category") ?? "all"; const fileType = params.get("fileType") ?? "all"; const sort = params.get("sort") ?? "newest"
  const query = useMemo<DocumentListQuery>(() => ({ page, limit, search: search || undefined, category: category === "all" ? undefined : category as DocumentCategory, fileType: fileType === "all" ? undefined : fileType as DocumentFileType, sort: sort as DocumentSort }), [page, limit, search, category, fileType, sort])
  useEffect(() => { void dispatch(fetchDocuments(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }
  const reload = () => dispatch(fetchDocuments(query)).unwrap().then(() => undefined)
  const download = async (document: SocietyDocument) => { try { await dispatch(recordDocumentDownload(document.id)).unwrap(); toast.success(`${document.title} download prepared.`) } catch (error) { toast.error(typeof error === "string" ? error : "Download could not be started.") } }
  const columns: DataTableColumn<SocietyDocument>[] = [
    { id: "title", header: "Document", cell: (item) => <div className="flex min-w-56 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="size-5" /></span><div className="min-w-0"><p className="max-w-72 truncate font-semibold">{item.title}</p><p className="mt-0.5 max-w-80 truncate text-xs text-muted-foreground">{item.description}</p></div></div> },
    { id: "category", header: "Category", cell: (item) => <Badge variant="outline" className="capitalize">{item.category === "noc" ? "NOC" : item.category}</Badge> },
    { id: "file", header: "File", cell: (item) => <span className="uppercase text-xs font-semibold">{item.fileType} · {item.fileSize}</span> },
    { id: "version", header: "Version", cell: (item) => `v${item.version}`, hideOnMobile: true },
    { id: "uploaded", header: "Uploaded", cell: (item) => <div><p>{formatDate(item.uploadedAt)}</p><p className="text-xs text-muted-foreground">{item.uploadedBy}</p></div>, hideOnMobile: true },
    { id: "downloads", header: "Downloads", cell: (item) => <span className="inline-flex items-center gap-1.5"><Download className="size-3.5 text-muted-foreground" />{item.downloads.toLocaleString("en-IN")}</span>, hideOnMobile: true },
    { id: "actions", header: "Actions", headerClassName: "text-right", className: "text-right", cell: (item) => <DocumentActions document={item} compact onPreview={setPreview} onDownload={(value) => void download(value)} /> },
  ]
  if (state.error && !state.items.length) return <ErrorState title="Unable to load documents" description={state.error} onRetry={reload} />
  return <div className="space-y-6"><PageHeader title="Document center" description={`${state.pagination.total.toLocaleString("en-IN")} society documents, forms, and circulars`} icon={<FolderOpen className="size-5" />} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{categoryOptions.map((option) => <button key={option.value} type="button" onClick={() => update("category", category === option.value ? "all" : option.value)} className={`rounded-xl border p-3 text-left transition-colors hover:border-primary/40 ${category === option.value ? "border-primary bg-primary/5" : "border-border bg-card"}`}><File className="mb-2 size-4 text-primary" /><span className="text-sm font-semibold">{option.label}</span></button>)}</div>
    <TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search documents" />} filters={<><FilterSelect value={category} onValueChange={(value) => update("category", value)} options={categoryOptions} placeholder="Category" allLabel="All categories" /><FilterSelect value={fileType} onValueChange={(value) => update("fileType", value)} options={fileOptions} placeholder="File type" allLabel="All formats" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sortOptions} />} activeFilterCount={[search, category !== "all" && category, fileType !== "all" && fileType].filter(Boolean).length} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} />
    <DataTable data={state.items} columns={columns} getRowId={(item) => item.id} loading={state.loading && !state.items.length} emptyTitle="No documents found" emptyDescription="Try another search term or category." onRowClick={setPreview} />
    <TablePagination page={state.pagination.page} totalPages={state.pagination.totalPages} totalItems={state.pagination.total} pageSize={state.pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={state.loading} />
    <DocumentPreview document={preview} open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null) }} onDownload={(value) => void download(value)} />
  </div>
}
