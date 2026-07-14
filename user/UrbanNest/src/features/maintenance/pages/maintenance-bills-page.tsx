import { useEffect, useMemo } from "react"
import { Eye, Plus, ReceiptText } from "lucide-react"
import { useSelector } from "react-redux"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar, type DataTableColumn } from "@/components/table"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { MaintenanceStatusBadge } from "@/features/maintenance/components/maintenance-status-badge"
import { maintenanceTowerOptions } from "@/features/maintenance/data/maintenance.mock"
import { fetchMaintenanceBills, type MaintenanceState } from "@/features/maintenance/store/maintenance.slice"
import type { MaintenanceBill, MaintenanceBillQuery, MaintenancePaymentStatus, MaintenanceSort } from "@/features/maintenance/types/maintenance.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

const statusOptions: { label: string; value: MaintenancePaymentStatus }[] = [{ label: "Paid", value: "paid" }, { label: "Pending", value: "pending" }, { label: "Overdue", value: "overdue" }, { label: "Partially paid", value: "partially_paid" }]
const sortOptions = [{ label: "Newest", value: "newest" }, { label: "Due date (latest)", value: "due_desc" }, { label: "Due date (earliest)", value: "due_asc" }, { label: "Amount high-low", value: "amount_desc" }, { label: "Amount low-high", value: "amount_asc" }]
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
const date = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))

export function MaintenanceBillsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { bills, pagination, listLoading, error } = useSelector((state: { maintenance: MaintenanceState }) => state.maintenance)
  const currentUser = useSelector((state: { auth: { user: { id: string; role: string } | null } }) => state.auth.user)
  const role = currentUser?.role
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  const page = Math.max(1, Number(params.get("page")) || 1); const limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? ""; const status = params.get("status") ?? "all"; const tower = params.get("tower") ?? "all"; const month = params.get("month") ?? ""; const sort = params.get("sort") ?? "newest"
  const query = useMemo<MaintenanceBillQuery>(() => ({ page, limit, search: search || undefined, status: status === "all" ? undefined : status as MaintenancePaymentStatus, towerId: tower === "all" ? undefined : tower, month: month || undefined, residentId: role === ROLES.RESIDENT ? currentUser?.id : undefined, sort: sort as MaintenanceSort }), [page, limit, search, status, tower, month, sort, role, currentUser?.id])
  useEffect(() => { void dispatch(fetchMaintenanceBills(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }
  const reload = () => dispatch(fetchMaintenanceBills(query)).unwrap().then(() => undefined)
  const columns: DataTableColumn<MaintenanceBill>[] = [
    { id: "bill", header: "Bill", cell: (item) => <div><p className="font-semibold">{item.billNumber}</p><p className="text-xs text-muted-foreground">{item.billingMonth}</p></div> },
    { id: "resident", header: "Resident", cell: (item) => <div><p className="font-medium">{item.residentName}</p><p className="text-xs text-muted-foreground">{item.towerName} · {item.flatNumber}</p></div> },
    { id: "due", header: "Due date", cell: (item) => date(item.dueDate), hideOnMobile: true },
    { id: "amount", header: "Amount", cell: (item) => <span className="font-semibold">{money(item.totalAmount)}</span> },
    { id: "status", header: "Status", cell: (item) => <MaintenanceStatusBadge status={item.status} /> },
    { id: "actions", header: "", className: "text-right", cell: (item) => <Button size="icon-xs" variant="ghost" aria-label={`View ${item.billNumber}`} render={<Link to={`${ROUTES.MAINTENANCE}/${item.id}`} />}><Eye /></Button> },
  ]
  if (error && !bills.length) return <ErrorState title="Unable to load maintenance bills" description={error} onRetry={reload} />
  return <div className="space-y-6"><PageHeader title="Maintenance billing" description="Track monthly dues, fines, and collections." icon={<ReceiptText />} actions={canManage ? <Button render={<Link to={`${ROUTES.MAINTENANCE}/generate`} />}><Plus />Generate bill</Button> : undefined} /><TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search bill, resident or flat" />} filters={<><FilterSelect value={status} onValueChange={(value) => update("status", value)} options={statusOptions} placeholder="Status" allLabel="All statuses" /><FilterSelect value={tower} onValueChange={(value) => update("tower", value)} options={maintenanceTowerOptions.map((item) => ({ label: item.label, value: item.id }))} placeholder="Tower" allLabel="All towers" /><input aria-label="Billing month" type="month" value={month} onChange={(event) => update("month", event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sortOptions} />} activeFilterCount={[search, status !== "all" && status, tower !== "all" && tower, month].filter(Boolean).length} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} /><DataTable data={bills} columns={columns} getRowId={(item) => item.id} loading={listLoading && !bills.length} emptyTitle="No maintenance bills found" emptyDescription="Adjust filters or generate the first bill." onRowClick={(item) => navigate(`${ROUTES.MAINTENANCE}/${item.id}`)} /><TablePagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={listLoading} /></div>
}
