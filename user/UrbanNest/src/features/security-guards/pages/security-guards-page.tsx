import { useEffect, useMemo, type ReactNode } from "react"
import { Eye, Plus, ShieldCheck, SlidersHorizontal } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { ErrorState } from "@/components/feedback/error-state"
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
import { ROUTES } from "@/constants/routes.constants"
import { SecurityGuardActions } from "@/features/security-guards/components/security-guard-actions"
import { gateOptions, shiftOptions } from "@/features/security-guards/data/security-guards.mock"
import { fetchSecurityGuards } from "@/features/security-guards/store/security-guards.slice"
import type {
  GuardGate,
  GuardShiftName,
  GuardStatus,
  SecurityGuardListItem,
  SecurityGuardListQuery,
  SecurityGuardSortOption,
} from "@/features/security-guards/types/security-guard.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name A–Z", value: "name_asc" },
  { label: "Name Z–A", value: "name_desc" },
  { label: "Employee ID", value: "employee_id_asc" },
  { label: "Gate", value: "gate_asc" },
  { label: "Shift", value: "shift_asc" },
]

const statuses = new Set(statusOptions.map((option) => option.value))
const gates = new Set<string>(gateOptions)
const shifts = new Set<string>(shiftOptions.map((option) => option.name))
const sorts = new Set(sortOptions.map((option) => option.value))

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))

export function SecurityGuardsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { securityGuards, pagination, listLoading, error } = useAppSelector(
    (state) => state.securityGuards,
  )

  const page = Math.max(1, Number(params.get("page")) || 1)
  const limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? ""
  const gate = params.get("gate") ?? "all"
  const shift = params.get("shift") ?? "all"
  const status = params.get("status") ?? "all"
  const sort = params.get("sort") ?? "newest"

  const query = useMemo<SecurityGuardListQuery>(() => ({
    page,
    limit,
    search: search || undefined,
    gate: gates.has(gate) ? gate as GuardGate : undefined,
    shift: shifts.has(shift) ? shift as GuardShiftName : undefined,
    status: statuses.has(status) ? status as GuardStatus : undefined,
    sort: sorts.has(sort) ? sort as SecurityGuardSortOption : "newest",
  }), [page, limit, search, gate, shift, status, sort])

  useEffect(() => {
    void dispatch(fetchSecurityGuards(query))
  }, [dispatch, query])

  const updateParam = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(params)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    if (resetPage) next.set("page", "1")
    setParams(next, { replace: true })
  }

  const reload = () => dispatch(fetchSecurityGuards(query)).unwrap().then(() => undefined)
  const activeFilterCount = [
    search,
    gate !== "all" ? gate : "",
    shift !== "all" ? shift : "",
    status !== "all" ? status : "",
  ].filter(Boolean).length

  const columns: DataTableColumn<SecurityGuardListItem>[] = [
    {
      id: "avatar",
      header: "Avatar",
      cell: (guard) => <UserAvatar name={guard.fullName} imageUrl={guard.profileImageUrl} size="sm" />,
    },
    {
      id: "name",
      header: "Name",
      cell: (guard) => (
        <div className="min-w-44">
          <p className="font-semibold text-foreground">{guard.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{guard.email}</p>
        </div>
      ),
    },
    { id: "employee-id", header: "Employee ID", cell: (guard) => <span className="font-medium">{guard.employeeId}</span> },
    { id: "gate", header: "Gate", cell: (guard) => <Badge variant="outline">{guard.gate}</Badge> },
    {
      id: "shift",
      header: "Shift",
      cell: (guard) => (
        <div>
          <p className="font-medium">{guard.shift.name}</p>
          <p className="text-xs text-muted-foreground">{guard.shift.startTime}–{guard.shift.endTime}</p>
        </div>
      ),
      hideOnMobile: true,
    },
    { id: "mobile", header: "Mobile", cell: (guard) => guard.mobile, hideOnMobile: true },
    { id: "joining-date", header: "Joining date", cell: (guard) => formatDate(guard.joiningDate), hideOnMobile: true },
    { id: "status", header: "Status", cell: (guard) => <StatusBadge status={guard.status} /> },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (guard) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`View ${guard.fullName}`}
            render={<Link to={`${ROUTES.SECURITY_GUARDS}/${guard.id}`} />}
          >
            <Eye aria-hidden="true" />
          </Button>
          <SecurityGuardActions
            guard={guard}
            variant="dropdown"
            onActionComplete={() => void reload()}
            onDeleted={() => void reload()}
          />
        </div>
      ),
    },
  ]

  const addAction: ReactNode = (
    <Button render={<Link to={`${ROUTES.SECURITY_GUARDS}/new`} />}>
      <Plus aria-hidden="true" />Add security guard
    </Button>
  )

  if (error && !securityGuards.length) {
    return (
      <ErrorState
        title="Unable to load security guards"
        description={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security guards"
        description={`${pagination.total.toLocaleString()} security staff records`}
        icon={<ShieldCheck className="size-5" />}
        actions={addAction}
      />
      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => updateParam("search", value)}
            placeholder="Search name, employee ID, email or mobile"
          />
        }
        filters={
          <>
            <FilterSelect
              value={gate}
              onValueChange={(value) => updateParam("gate", value)}
              options={gateOptions.map((item) => ({ label: item, value: item }))}
              placeholder="Gate"
              allLabel="All gates"
              icon={<SlidersHorizontal />}
            />
            <FilterSelect
              value={shift}
              onValueChange={(value) => updateParam("shift", value)}
              options={shiftOptions.map((item) => ({ label: item.name, value: item.name }))}
              placeholder="Shift"
              allLabel="All shifts"
            />
            <FilterSelect
              value={status}
              onValueChange={(value) => updateParam("status", value)}
              options={statusOptions}
              placeholder="Status"
              allLabel="All statuses"
            />
          </>
        }
        sort={
          <SortSelect
            value={sort}
            onValueChange={(value) => updateParam("sort", value)}
            options={sortOptions}
          />
        }
        activeFilterCount={activeFilterCount}
        onClearFilters={() => setParams({ page: "1", sort }, { replace: true })}
      />
      <DataTable
        data={securityGuards}
        columns={columns}
        getRowId={(guard) => guard.id}
        loading={listLoading && !securityGuards.length}
        emptyTitle="No security guards found"
        emptyDescription="Change the search or filters, or add a new security guard."
        emptyAction={addAction}
        onRowClick={(guard) => navigate(`${ROUTES.SECURITY_GUARDS}/${guard.id}`)}
      />
      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(value) => updateParam("page", String(value), false)}
        onPageSizeChange={(value) => updateParam("limit", String(value))}
        disabled={listLoading}
      />
    </div>
  )
}
