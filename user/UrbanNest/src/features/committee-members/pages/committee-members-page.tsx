import { useEffect, useMemo, type ReactNode } from "react"
import {
  Eye,
  Pencil,
  Plus,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react"
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
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { CommitteeMemberActions } from "@/features/committee-members/components/committee-member-actions"
import {
  committeeDepartments,
  committeeResponsibilities,
} from "@/features/committee-members/data/committee-members.mock"
import {
  fetchCommitteeMembers,
} from "@/features/committee-members/store/committee-members.slice"
import type {
  CommitteeMemberListItem,
  CommitteeMemberListQuery,
  CommitteeMemberSortOption,
  CommitteeMemberStatus,
} from "@/features/committee-members/types/committee-member.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const sortOptions = [
  { label: "Newest joined", value: "newest" },
  { label: "Oldest joined", value: "oldest" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
  { label: "Department A-Z", value: "department_asc" },
]

const validStatuses = new Set(statusOptions.map((option) => option.value))
const validSorts = new Set(sortOptions.map((option) => option.value))

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  )

function Responsibilities({ values }: { values: string[] }) {
  const visible = values.slice(0, 2)
  const remaining = values.length - visible.length

  return (
    <div className="flex max-w-xs flex-wrap gap-1.5">
      {visible.map((item) => (
        <Badge key={item} variant="outline" className="whitespace-nowrap">
          {item}
        </Badge>
      ))}
      {remaining > 0 ? (
        <Badge variant="secondary" aria-label={`${remaining} more responsibilities`}>
          +{remaining}
        </Badge>
      ) : null}
    </div>
  )
}

export function CommitteeMembersPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUserRole = useAppSelector((state) => state.auth.user?.role)
  const { members, pagination, listLoading, error } = useAppSelector(
    (state) => state.committeeMembers,
  )

  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10)
  const search = searchParams.get("search") ?? ""
  const department = searchParams.get("department") ?? "all"
  const status = searchParams.get("status") ?? "all"
  const responsibility = searchParams.get("responsibility") ?? "all"
  const sort = searchParams.get("sort") ?? "newest"

  const query = useMemo<CommitteeMemberListQuery>(
    () => ({
      page,
      limit,
      search: search || undefined,
      department: department !== "all" ? department : undefined,
      status: validStatuses.has(status)
        ? (status as CommitteeMemberStatus)
        : undefined,
      responsibility:
        responsibility !== "all" ? responsibility : undefined,
      sort: validSorts.has(sort)
        ? (sort as CommitteeMemberSortOption)
        : "newest",
    }),
    [department, limit, page, responsibility, search, sort, status],
  )

  useEffect(() => {
    if (currentUserRole === ROLES.COMMITTEE_HEAD) {
      void dispatch(fetchCommitteeMembers(query))
    }
  }, [currentUserRole, dispatch, query])

  const updateSearchParam = (
    key: string,
    value: string,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    if (resetPage) next.set("page", "1")
    setSearchParams(next, { replace: true })
  }

  const activeFilterCount = [
    search,
    department !== "all" ? department : "",
    status !== "all" ? status : "",
    responsibility !== "all" ? responsibility : "",
  ].filter(Boolean).length

  const addAction: ReactNode = (
    <Button render={<Link to={`${ROUTES.COMMITTEE_MEMBERS}/new`} />}>
      <Plus aria-hidden="true" />
      Add Committee Member
    </Button>
  )

  const columns: DataTableColumn<CommitteeMemberListItem>[] = [
    {
      id: "avatar",
      header: "Avatar",
      cell: (member) => (
        <UserAvatar
          name={member.fullName}
          imageUrl={member.profileImageUrl}
          size="sm"
        />
      ),
      className: "w-16",
      hideOnMobile: true,
    },
    {
      id: "name",
      header: "Name",
      cell: (member) => (
        <div className="min-w-40">
          <p className="font-semibold text-foreground">{member.fullName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
            {member.email}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {member.designation}
          </p>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (member) => member.email,
      hideOnMobile: true,
    },
    {
      id: "mobile",
      header: "Mobile",
      cell: (member) => member.mobile,
      hideOnMobile: true,
    },
    {
      id: "responsibilities",
      header: "Assigned Responsibilities",
      cell: (member) => <Responsibilities values={member.responsibilities} />,
      hideOnMobile: true,
    },
    {
      id: "joined",
      header: "Joined Date",
      cell: (member) => formatDate(member.joinedDate),
      hideOnMobile: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (member) => <StatusBadge status={member.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (member) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`View ${member.fullName}`}
            render={
              <Link to={`${ROUTES.COMMITTEE_MEMBERS}/${member.id}`} />
            }
          >
            <Eye aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Edit ${member.fullName}`}
            render={
              <Link to={`${ROUTES.COMMITTEE_MEMBERS}/${member.id}/edit`} />
            }
          >
            <Pencil aria-hidden="true" />
          </Button>
          <CommitteeMemberActions
            member={member}
            currentUserRole={currentUserRole}
            variant="dropdown"
            onActionComplete={(action) => {
              if (action === "remove") {
                void dispatch(fetchCommitteeMembers(query))
              }
            }}
          />
        </div>
      ),
    },
  ]

  if (currentUserRole !== ROLES.COMMITTEE_HEAD) {
    return (
      <ErrorState
        title="Committee Head access required"
        description="Only the Committee Head can manage committee members."
      />
    )
  }

  if (error && !members.length) {
    return (
      <ErrorState
        title="Unable to load committee members"
        description={error}
        onRetry={() =>
          dispatch(fetchCommitteeMembers(query))
            .unwrap()
            .then(() => undefined)
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Committee Members"
        description={`${pagination.total.toLocaleString()} committee member records`}
        icon={<UsersRound className="size-5" />}
        actions={addAction}
      />

      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => updateSearchParam("search", value)}
            placeholder="Search name, email, mobile, role or responsibility"
          />
        }
        filters={
          <>
            <FilterSelect
              value={department}
              onValueChange={(value) =>
                updateSearchParam("department", value)
              }
              options={committeeDepartments.map((item) => ({
                label: item,
                value: item,
              }))}
              placeholder="Department"
              allLabel="All departments"
              icon={<SlidersHorizontal />}
            />
            <FilterSelect
              value={status}
              onValueChange={(value) => updateSearchParam("status", value)}
              options={statusOptions}
              placeholder="Status"
              allLabel="All statuses"
            />
            <FilterSelect
              value={responsibility}
              onValueChange={(value) =>
                updateSearchParam("responsibility", value)
              }
              options={committeeResponsibilities.map((item) => ({
                label: item,
                value: item,
              }))}
              placeholder="Responsibility"
              allLabel="All responsibilities"
            />
          </>
        }
        sort={
          <SortSelect
            value={sort}
            onValueChange={(value) => updateSearchParam("sort", value)}
            options={sortOptions}
          />
        }
        activeFilterCount={activeFilterCount}
        onClearFilters={() =>
          setSearchParams({ page: "1", sort }, { replace: true })
        }
      />

      <DataTable
        data={members}
        columns={columns}
        getRowId={(member) => member.id}
        loading={listLoading && !members.length}
        emptyTitle="No committee members found"
        emptyDescription="Change the search or filters, or add a new committee member."
        emptyAction={addAction}
        onRowClick={(member) =>
          navigate(`${ROUTES.COMMITTEE_MEMBERS}/${member.id}`)
        }
      />

      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(value) =>
          updateSearchParam("page", String(value), false)
        }
        onPageSizeChange={(value) =>
          updateSearchParam("limit", String(value))
        }
        disabled={listLoading}
      />
    </div>
  )
}

