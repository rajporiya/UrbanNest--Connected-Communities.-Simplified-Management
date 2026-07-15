export type DocumentCategory = "rules" | "minutes" | "circulars" | "forms" | "noc"
export type DocumentFileType = "pdf" | "docx" | "xlsx"
export type DocumentSort = "newest" | "oldest" | "title_asc" | "title_desc" | "downloads_desc"

export interface SocietyDocument {
  id: string
  title: string
  description: string
  category: DocumentCategory
  fileType: DocumentFileType
  fileSize: string
  fileUrl: string
  previewUrl: string | null
  version: string
  uploadedBy: string
  uploadedAt: string
  downloads: number
}

export interface DocumentListQuery {
  page?: number
  limit?: number
  search?: string
  category?: DocumentCategory
  fileType?: DocumentFileType
  sort?: DocumentSort
}

export interface DocumentListResponse {
  items: SocietyDocument[]
  total: number
  page: number
  limit: number
  totalPages: number
}
