import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CalendarClock,
  Eye,
  LogIn,
  LogOut,
  Plus,
  UsersRound,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { DataTable, type DataTableColumn } from "@/components/table/data-table"
import { SearchInput } from "@/components/table/search-input"
import { FilterSelect } from "@/components/table/filter-select"
import { SortSelect } from "@/components/table/sort-select"
import { TableToolbar } from "@/components/table/table-toolbar"
import { TablePagination } from "@/components/table/table-pagination"
import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge"
import {
  fetchVisitorReport,
  fetchVisitors,
} from "@/features/visitors/store/visitors.slice"
import type { VisitorsState } from "@/features/visitors/store/visitors.slice"
import type {
  VisitorPass,
  VisitorSort,
  VisitorStatus,
} from "@/features/visitors/types/visitor.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

interface State {
  visitors: VisitorsState
  auth: AuthState
}
const date = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`)
  )
export function VisitorsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, pagination, report, loading, error } = useSelector(
    (state: State) => state.visitors
  )
  const user = useSelector((state: State) => state.auth.user)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState<VisitorSort>("visit_desc")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  useEffect(() => {
    void dispatch(
      fetchVisitors({
        search,
        status: status ? (status as VisitorStatus) : undefined,
        sort,
        page,
        limit,
        residentId: user?.role === ROLES.RESIDENT ? user.id : undefined,
      })
    )
  }, [dispatch, search, status, sort, page, limit, user?.id, user?.role])
  useEffect(() => {
    if (
      user?.role === ROLES.COMMITTEE_HEAD ||
      user?.role === ROLES.COMMITTEE_MEMBER
    ) {
      void dispatch(fetchVisitorReport())
    }
  }, [dispatch, user?.role])
  const columns = useMemo<DataTableColumn<VisitorPass>[]>(
    () => [
      {
        id: "visitor",
        header: "Visitor",
        cell: (row) => (
          <div>
            <p className="font-medium">{row.visitorName}</p>
            <p className="text-xs text-muted-foreground">{row.mobile}</p>
          </div>
        ),
      },
      {
        id: "home",
        header: "Visiting",
        cell: (row) => (
          <div>
            <p>{row.residentName}</p>
            <p className="text-xs text-muted-foreground">
              {row.tower} · {row.flatNumber}
            </p>
          </div>
        ),
        hideOnMobile: true,
      },
      {
        id: "schedule",
        header: "Visit window",
        cell: (row) => (
          <div>
            <p>{date(row.visitDate)}</p>
            <p className="text-xs text-muted-foreground">
              {row.validFrom}–{row.validUntil}
            </p>
          </div>
        ),
      },
      {
        id: "purpose",
        header: "Purpose",
        cell: (row) => <span className="capitalize">{row.purpose}</span>,
        hideOnMobile: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <VisitorStatusBadge status={row.status} />,
      },
      {
        id: "action",
        header: <span className="sr-only">Actions</span>,
        cell: (row) => (
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link to={`${ROUTES.VISITORS}/${row.id}`} />}
            aria-label={`View ${row.visitorName}`}
          >
            <Eye />
          </Button>
        ),
      },
    ],
    []
  )
  let actions: ReactNode = null
  if (user?.role === ROLES.RESIDENT)
    actions = (
      <Button render={<Link to={`${ROUTES.VISITORS}/new`} />}>
        <Plus />
        New pass
      </Button>
    )
  if (user?.role === ROLES.SECURITY_GUARD)
    actions = (
      <Button render={<Link to={`${ROUTES.VISITORS}/new`} />}>
        <Plus />
        Add manually
      </Button>
    )
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          user?.role === ROLES.SECURITY_GUARD
            ? "Visitor logs"
            : user?.role === ROLES.RESIDENT
              ? "My visitors"
              : "Visitor reports"
        }
        description="Review visitor passes and society entry activity."
        icon={<UsersRound className="size-5" />}
        actions={actions}
      />

      {(user?.role === ROLES.COMMITTEE_HEAD ||
        user?.role === ROLES.COMMITTEE_MEMBER) && (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Visitor report summary"
        >
          <StatCard
            label="Today's visitors"
            value={report?.today ?? 0}
            icon={<CalendarClock />}
            loading={!report}
          />
          <StatCard
            label="Expected"
            value={report?.expected ?? 0}
            icon={<UsersRound />}
            loading={!report}
          />
          <StatCard
            label="Currently inside"
            value={report?.inside ?? 0}
            icon={<LogIn />}
            loading={!report}
          />
          <StatCard
            label="Completed visits"
            value={report?.completed ?? 0}
            icon={<LogOut />}
            loading={!report}
          />
        </section>
      )}
      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search visitor, mobile, flat or QR"
          />
        }
        filters={
          <FilterSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : value)
              setPage(1)
            }}
            options={[
              { label: "Expected", value: "expected" },
              { label: "Checked in", value: "checked-in" },
              { label: "Checked out", value: "checked-out" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            placeholder="Status"
          />
        }
        sort={
          <SortSelect
            value={sort}
            onValueChange={(value) => setSort(value as VisitorSort)}
            options={[
              { label: "Newest visit", value: "visit_desc" },
              { label: "Oldest visit", value: "visit_asc" },
              { label: "Name A–Z", value: "name_asc" },
              { label: "Name Z–A", value: "name_desc" },
            ]}
          />
        }
        activeFilterCount={status ? 1 : 0}
        onClearFilters={() => setStatus("")}
      />
      {error && !items.length ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
        >
          {error}
        </div>
      ) : (
        <DataTable
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading && !items.length}
          emptyTitle="No visitor records"
          emptyDescription="No passes match the current view."
          onRowClick={(row) => navigate(`${ROUTES.VISITORS}/${row.id}`)}
        />
      )}
      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setLimit(value)
          setPage(1)
        }}
        disabled={loading}
      />
    </div>
  )
}
