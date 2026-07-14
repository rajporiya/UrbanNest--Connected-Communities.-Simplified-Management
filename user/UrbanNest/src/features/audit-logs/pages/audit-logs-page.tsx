import { useEffect, useMemo, useState } from "react"
import { Eye, History, SlidersHorizontal } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { PageHeader } from "@/components/layout/page-header"
import {
  DataTable,
  FilterSelect,
  SearchInput,
  SortSelect,
  TablePagination,
  TableToolbar,
  type DataTableColumn,
} from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuditLogDetailsDrawer } from "@/features/audit-logs/components/audit-log-details-drawer"
import { fetchAuditLogs } from "@/features/audit-logs/store/audit-logs.slice"
import type {
  AuditAction,
  AuditLog,
  AuditLogQuery,
  AuditModule,
  AuditSeverity,
} from "@/features/audit-logs/types/audit-log.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const actionOptions = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "approve",
  "payment",
].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))
const moduleOptions = [
  "auth",
  "residents",
  "visitors",
  "complaints",
  "payments",
  "settings",
].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))
const severityOptions = ["info", "warning", "critical"].map((value) => ({
  label: value[0].toUpperCase() + value.slice(1),
  value,
}))

export function AuditLogsPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<AuditLog | null>(null)
  const state = useAppSelector((root) => root.auditLogs)
  const query = useMemo<AuditLogQuery>(
    () => ({
      page: Math.max(1, Number(params.get("page")) || 1),
      limit: Math.max(5, Number(params.get("limit")) || 10),
      search: params.get("search") || undefined,
      action: (params.get("action") as AuditAction) || undefined,
      module: (params.get("module") as AuditModule) || undefined,
      severity: (params.get("severity") as AuditSeverity) || undefined,
      sort: params.get("sort") === "oldest" ? "oldest" : "newest",
    }),
    [params]
  )
  useEffect(() => {
    void dispatch(fetchAuditLogs(query))
  }, [dispatch, query])
  const setParam = (key: string, value: string, reset = true) => {
    const next = new URLSearchParams(params)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    if (reset) next.set("page", "1")
    setParams(next, { replace: true })
  }
  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: "event",
      header: "Event",
      cell: (log) => (
        <div className="min-w-48">
          <p className="font-medium">{log.summary}</p>
          <p className="text-xs text-muted-foreground">{log.id}</p>
        </div>
      ),
    },
    {
      id: "actor",
      header: "User",
      cell: (log) => (
        <div>
          <p>{log.userName}</p>
          <p className="text-xs text-muted-foreground">{log.userRole}</p>
        </div>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: (log) => <Badge variant="outline">{log.action}</Badge>,
    },
    {
      id: "severity",
      header: "Severity",
      cell: (log) => (
        <Badge
          variant={log.severity === "critical" ? "destructive" : "secondary"}
        >
          {log.severity}
        </Badge>
      ),
    },
    {
      id: "time",
      header: "Time",
      cell: (log) =>
        new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(log.timestamp)),
      hideOnMobile: true,
    },
    {
      id: "view",
      header: "",
      cell: (log) => (
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={`View ${log.id}`}
          onClick={() => setSelected(log)}
        >
          <Eye />
        </Button>
      ),
      className: "text-right",
    },
  ]
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        description={`${state.total.toLocaleString("en-IN")} immutable activity records`}
        icon={<History className="size-5" />}
      />
      <TableToolbar
        search={
          <SearchInput
            value={query.search ?? ""}
            onChange={(value) => setParam("search", value)}
            placeholder="Search user, event, or IP"
          />
        }
        filters={
          <>
            <FilterSelect
              value={query.action ?? "all"}
              onValueChange={(value) => setParam("action", value)}
              options={actionOptions}
              allLabel="All actions"
              icon={<SlidersHorizontal />}
            />
            <FilterSelect
              value={query.module ?? "all"}
              onValueChange={(value) => setParam("module", value)}
              options={moduleOptions}
              allLabel="All modules"
            />
            <FilterSelect
              value={query.severity ?? "all"}
              onValueChange={(value) => setParam("severity", value)}
              options={severityOptions}
              allLabel="All severities"
            />
          </>
        }
        sort={
          <SortSelect
            value={query.sort ?? "newest"}
            onValueChange={(value) => setParam("sort", value)}
            options={[
              { label: "Newest first", value: "newest" },
              { label: "Oldest first", value: "oldest" },
            ]}
          />
        }
        activeFilterCount={
          [query.search, query.action, query.module, query.severity].filter(
            Boolean
          ).length
        }
        onClearFilters={() =>
          setParams({ sort: query.sort ?? "newest" }, { replace: true })
        }
      />
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      <DataTable
        data={state.items}
        columns={columns}
        getRowId={(log) => log.id}
        loading={state.loading && !state.items.length}
        emptyTitle="No audit events"
        emptyDescription="No activity matches the selected filters."
        onRowClick={setSelected}
      />
      <TablePagination
        page={state.page}
        totalPages={state.totalPages}
        totalItems={state.total}
        pageSize={state.limit}
        onPageChange={(page) => setParam("page", String(page), false)}
        onPageSizeChange={(limit) => setParam("limit", String(limit))}
        disabled={state.loading}
      />
      <AuditLogDetailsDrawer
        log={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}
