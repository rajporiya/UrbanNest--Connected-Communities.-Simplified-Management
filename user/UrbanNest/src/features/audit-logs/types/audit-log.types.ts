export type AuditAction =
  "create" | "update" | "delete" | "login" | "logout" | "approve" | "payment"
export type AuditModule =
  "auth" | "residents" | "visitors" | "complaints" | "payments" | "settings"
export type AuditSeverity = "info" | "warning" | "critical"

export interface AuditLog {
  id: string
  action: AuditAction
  module: AuditModule
  severity: AuditSeverity
  userId: string
  userName: string
  userRole: string
  summary: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  changes: Array<{ field: string; before: string; after: string }>
}

export interface AuditLogQuery {
  page?: number
  limit?: number
  search?: string
  action?: AuditAction
  module?: AuditModule
  severity?: AuditSeverity
  from?: string
  to?: string
  sort?: "newest" | "oldest"
}

export interface AuditLogResponse {
  items: AuditLog[]
  page: number
  limit: number
  total: number
  totalPages: number
}
