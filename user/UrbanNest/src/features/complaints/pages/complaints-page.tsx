import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Eye, MessageSquareWarning, Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { PriorityBadge } from "@/components/common/priority-badge"
import { DataTable, type DataTableColumn } from "@/components/table/data-table"
import { SearchInput } from "@/components/table/search-input"
import { FilterSelect } from "@/components/table/filter-select"
import { SortSelect } from "@/components/table/sort-select"
import { TableToolbar } from "@/components/table/table-toolbar"
import { TablePagination } from "@/components/table/table-pagination"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { ComplaintStatusBadge } from "@/features/complaints/components/complaint-status-badge"
import { fetchComplaints } from "@/features/complaints/store/complaints.slice"
import type { ComplaintsState } from "@/features/complaints/store/complaints.slice"
import type {
  Complaint,
  ComplaintPriority,
  ComplaintSort,
  ComplaintStatus,
} from "@/features/complaints/types/complaint.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  complaints: ComplaintsState
  auth: AuthState
}
export function ComplaintsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, pagination, loading, error } = useSelector(
    (state: State) => state.complaints
  )
  const user = useSelector((state: State) => state.auth.user)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [sort, setSort] = useState<ComplaintSort>("newest")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  useEffect(() => {
    void dispatch(
      fetchComplaints({
        search,
        status: status ? (status as ComplaintStatus) : undefined,
        priority: priority ? (priority as ComplaintPriority) : undefined,
        sort,
        page,
        limit,
        residentId: user?.role === ROLES.RESIDENT ? user.id : undefined,
        assigneeId: user?.role === ROLES.COMMITTEE_MEMBER ? user.id : undefined,
      })
    )
  }, [
    dispatch,
    search,
    status,
    priority,
    sort,
    page,
    limit,
    user?.id,
    user?.role,
  ])
  const columns = useMemo<DataTableColumn<Complaint>[]>(
    () => [
      {
        id: "issue",
        header: "Complaint",
        cell: (row) => (
          <div className="max-w-xs">
            <p className="truncate font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {row.category} · {row.id}
            </p>
          </div>
        ),
      },
      {
        id: "resident",
        header: "Resident",
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
        id: "priority",
        header: "Priority",
        cell: (row) => <PriorityBadge priority={row.priority} />,
      },
      {
        id: "assigned",
        header: "Assigned to",
        cell: (row) => row.assignedTo ?? "Unassigned",
        hideOnMobile: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <ComplaintStatusBadge status={row.status} />,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        cell: (row) => (
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link to={`${ROUTES.COMPLAINTS}/${row.id}`} />}
            aria-label={`View ${row.title}`}
          >
            <Eye />
          </Button>
        ),
      },
    ],
    []
  )
  const action: ReactNode =
    user?.role === ROLES.RESIDENT ? (
      <Button render={<Link to={`${ROUTES.COMPLAINTS}/new`} />}>
        <Plus />
        Raise complaint
      </Button>
    ) : null
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          user?.role === ROLES.RESIDENT
            ? "My complaints"
            : "Complaint management"
        }
        description="Track issues, assignments, and resolution progress."
        icon={<MessageSquareWarning className="size-5" />}
        actions={action}
      />
      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search complaints"
          />
        }
        filters={
          <>
            <FilterSelect
              value={status}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : value)
                setPage(1)
              }}
              options={[
                "created",
                "assigned",
                "in-progress",
                "resolved",
                "closed",
              ].map((value) => ({ label: value.replace("-", " "), value }))}
              placeholder="Status"
            />
            <FilterSelect
              value={priority}
              onValueChange={(value) => {
                setPriority(value === "all" ? "" : value)
                setPage(1)
              }}
              options={["low", "medium", "high", "emergency"].map((value) => ({
                label: value,
                value,
              }))}
              placeholder="Priority"
            />
          </>
        }
        sort={
          <SortSelect
            value={sort}
            onValueChange={(value) => setSort(value as ComplaintSort)}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Oldest", value: "oldest" },
              { label: "Highest priority", value: "priority_desc" },
              { label: "Lowest priority", value: "priority_asc" },
            ]}
          />
        }
        activeFilterCount={Number(Boolean(status)) + Number(Boolean(priority))}
        onClearFilters={() => {
          setStatus("")
          setPriority("")
        }}
      />
      <DataTable
        data={items}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading && !items.length}
        emptyTitle="No complaints found"
        emptyDescription={error ?? "No complaints match this view."}
        onRowClick={(row) => navigate(`${ROUTES.COMPLAINTS}/${row.id}`)}
      />
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
      />
    </div>
  )
}
