export type ReportCategory =
  "users" | "payments" | "complaints" | "visitors" | "amenities" | "security"
export type ReportExportFormat = "pdf" | "excel" | "csv"

export interface ReportQuery {
  category: ReportCategory
  from?: string
  to?: string
}

export interface ReportMetric {
  id: string
  label: string
  value: string
  change: number
}

export interface ReportChartPoint {
  label: string
  primary: number
  secondary: number
}

export interface ReportTableRow {
  id: string
  name: string
  category: string
  value: string
  status: string
  date: string
}

export interface ReportSnapshot {
  category: ReportCategory
  title: string
  description: string
  generatedAt: string
  metrics: ReportMetric[]
  chart: ReportChartPoint[]
  rows: ReportTableRow[]
}
