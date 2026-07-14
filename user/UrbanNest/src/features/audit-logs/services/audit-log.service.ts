import { auditLogsMock } from "@/features/audit-logs/data/audit-logs.mock"
import { auditLogQuerySchema } from "@/features/audit-logs/schemas/audit-log.schema"
import type {
  AuditLogQuery,
  AuditLogResponse,
} from "@/features/audit-logs/types/audit-log.types"

const wait = () =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, 180))
const normalized = (value: string) => value.trim().toLowerCase()

export const auditLogService = {
  async getLogs(query: AuditLogQuery = {}): Promise<AuditLogResponse> {
    await wait()
    auditLogQuerySchema.parse(query)
    let items = structuredClone(auditLogsMock)
    const search = normalized(query.search ?? "")
    if (search)
      items = items.filter((log) =>
        [log.userName, log.summary, log.details, log.ipAddress].some((value) =>
          normalized(value).includes(search)
        )
      )
    if (query.action) items = items.filter((log) => log.action === query.action)
    if (query.module) items = items.filter((log) => log.module === query.module)
    if (query.severity)
      items = items.filter((log) => log.severity === query.severity)
    if (query.from)
      items = items.filter(
        (log) => log.timestamp >= `${query.from}T00:00:00.000Z`
      )
    if (query.to)
      items = items.filter(
        (log) => log.timestamp <= `${query.to}T23:59:59.999Z`
      )
    items.sort((a, b) =>
      query.sort === "oldest"
        ? Date.parse(a.timestamp) - Date.parse(b.timestamp)
        : Date.parse(b.timestamp) - Date.parse(a.timestamp)
    )
    const limit = query.limit ?? 10
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(query.page ?? 1, totalPages)
    return {
      items: items.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total,
      totalPages,
    }
  },
}
