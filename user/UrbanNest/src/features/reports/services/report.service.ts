import { reportSnapshots } from "@/features/reports/data/reports.mock"
import { reportQuerySchema } from "@/features/reports/schemas/report.schema"
import type {
  ReportExportFormat,
  ReportQuery,
  ReportSnapshot,
} from "@/features/reports/types/report.types"

const wait = () =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, 180))

function toCsv(snapshot: ReportSnapshot) {
  const header = "Name,Category,Value,Status,Date"
  const rows = snapshot.rows.map((row) =>
    [row.name, row.category, row.value, row.status, row.date]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(",")
  )
  return [header, ...rows].join("\n")
}

export const reportService = {
  async getReport(query: ReportQuery): Promise<ReportSnapshot> {
    await wait()
    reportQuerySchema.parse(query)
    return structuredClone(reportSnapshots[query.category])
  },
  async exportReport(
    query: ReportQuery,
    format: ReportExportFormat
  ): Promise<{ blob: Blob; filename: string }> {
    const snapshot = await this.getReport(query)
    const csv = toCsv(snapshot)
    const mime =
      format === "pdf"
        ? "application/pdf"
        : format === "excel"
          ? "application/vnd.ms-excel"
          : "text/csv"
    return {
      blob: new Blob([csv], { type: mime }),
      filename: `urbannest-${query.category}-report.${format === "excel" ? "xls" : format}`,
    }
  },
}
