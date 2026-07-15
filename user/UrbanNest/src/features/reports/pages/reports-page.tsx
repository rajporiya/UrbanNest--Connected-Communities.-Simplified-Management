import { useEffect, useState } from "react"
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react"
import { toast } from "sonner"

import { StatisticsGrid } from "@/components/global"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, type DataTableColumn } from "@/components/table"
import { Button } from "@/components/ui/button"
import { ReportChart } from "@/features/reports/components/report-chart"
import { ReportFilters } from "@/features/reports/components/report-filters"
import { reportService } from "@/features/reports/services/report.service"
import { fetchReport } from "@/features/reports/store/reports.slice"
import type {
  ReportExportFormat,
  ReportQuery,
  ReportTableRow,
} from "@/features/reports/types/report.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value)
  )

export function ReportsPage() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((state) => state.reports)
  const [query, setQuery] = useState<ReportQuery>({ category: "users" })
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null)
  useEffect(() => {
    void dispatch(fetchReport(query))
  }, [dispatch, query])

  const download = async (format: ReportExportFormat) => {
    setExporting(format)
    try {
      const file = await reportService.exportReport(query, format)
      const url = URL.createObjectURL(file.blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = file.filename
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} report exported`)
    } catch {
      toast.error("Report export failed")
    } finally {
      setExporting(null)
    }
  }

  const columns: DataTableColumn<ReportTableRow>[] = [
    {
      id: "name",
      header: "Record",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { id: "category", header: "Category", cell: (row) => row.category },
    { id: "value", header: "Value", cell: (row) => row.value },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {row.status}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (row) => formatDate(row.date),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyze society operations and export decision-ready reports."
        icon={<BarChart3 className="size-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void download("pdf")}
              disabled={Boolean(exporting)}
            >
              <FileText />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => void download("excel")}
              disabled={Boolean(exporting)}
            >
              <FileSpreadsheet />
              Excel
            </Button>
            <Button
              onClick={() => void download("csv")}
              disabled={Boolean(exporting)}
            >
              <Download />
              CSV
            </Button>
          </div>
        }
      />
      <ReportFilters value={query} onChange={setQuery} />
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      <StatisticsGrid
        items={(data?.metrics ?? []).map((metric) => ({
          id: metric.id,
          label: metric.label,
          value: metric.value,
          trend: {
            value: metric.change,
            direction: metric.change >= 0 ? ("up" as const) : ("down" as const),
            label: "vs previous period",
          },
          loading,
        }))}
      />
      {data ? <ReportChart data={data.chart} title={data.title} /> : null}
      <DataTable
        data={data?.rows ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading && !data}
        emptyTitle="No report data"
        emptyDescription="Try a different category or date range."
      />
    </div>
  )
}
