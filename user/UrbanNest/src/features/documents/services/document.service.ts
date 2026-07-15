import { mockDocuments } from "@/features/documents/data/documents.mock"
import type { DocumentListQuery, DocumentListResponse, SocietyDocument } from "@/features/documents/types/document.types"

const store = structuredClone(mockDocuments)
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 210))
const clone = <T,>(value: T): T => structuredClone(value)
const indexOf = (id: string) => { const index = store.findIndex((item) => item.id === id); if (index < 0) throw new Error("Document not found"); return index }

export const documentService = {
  async list(query: DocumentListQuery = {}): Promise<DocumentListResponse> {
    await wait()
    const search = query.search?.trim().toLowerCase() ?? ""
    const items = store.filter((item) => (!search || `${item.title} ${item.description} ${item.uploadedBy}`.toLowerCase().includes(search)) && (!query.category || item.category === query.category) && (!query.fileType || item.fileType === query.fileType))
    items.sort((left, right) => {
      switch (query.sort ?? "newest") {
        case "oldest": return Date.parse(left.uploadedAt) - Date.parse(right.uploadedAt)
        case "title_asc": return left.title.localeCompare(right.title)
        case "title_desc": return right.title.localeCompare(left.title)
        case "downloads_desc": return right.downloads - left.downloads
        default: return Date.parse(right.uploadedAt) - Date.parse(left.uploadedAt)
      }
    })
    const limit = Math.max(1, query.limit ?? 10); const total = items.length; const totalPages = Math.max(1, Math.ceil(total / limit)); const page = Math.min(Math.max(1, query.page ?? 1), totalPages)
    return { items: clone(items.slice((page - 1) * limit, page * limit)), total, page, limit, totalPages }
  },
  async get(id: string): Promise<SocietyDocument> { await wait(); return clone(store[indexOf(id)]) },
  async recordDownload(id: string): Promise<SocietyDocument> { await wait(); const index = indexOf(id); store[index] = { ...store[index], downloads: store[index].downloads + 1 }; return clone(store[index]) },
}
