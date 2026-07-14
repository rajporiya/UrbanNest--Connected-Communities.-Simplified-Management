import { useEffect, useMemo, type ReactNode } from "react"
import {
  Building2,
  Eye,
  Layers3,
  Plus,
  SlidersHorizontal,
} from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { StatusBadge } from "@/components/common/status-badge"
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
import { TowerActions } from "@/features/towers/components/tower-actions"
import { fetchTowers } from "@/features/towers/store/towers.slice"
import type {
  TowerListItem,
  TowerListQuery,
  TowerSortOption,
  TowerStatus,
} from "@/features/towers/types/tower.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const sortOptions = [
  { label: "Tower name: A to Z", value: "name_asc" },
  { label: "Tower name: Z to A", value: "name_desc" },
  { label: "Most floors", value: "floors_desc" },
  { label: "Fewest floors", value: "floors_asc" },
  { label: "Most flats", value: "flats_desc" },
  { label: "Fewest flats", value: "flats_asc" },
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
]

const statuses = new Set(statusOptions.map((option) => option.value))
const sorts = new Set(sortOptions.map((option) => option.value))

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  )

export function TowersPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { towers, pagination, listLoading, error } = useAppSelector(
    (state) => state.towers,
  )

  const page = Math.max(1, Number(params.get("page")) || 1)
  const limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? ""
  const status = params.get("status") ?? "all"
  const sort = params.get("sort") ?? "name_asc"

  const query = useMemo<TowerListQuery>(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statuses.has(status) ? (status as TowerStatus) : undefined,
      sort: sorts.has(sort) ? (sort as TowerSortOption) : "name_asc",
    }),
    [page, limit, search, status, sort],
  )

  useEffect(() => {
    void dispatch(fetchTowers(query))
  }, [dispatch, query])

  const updateParam = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(params)

    if (!value || value === "all") next.delete(key)
    else next.set(key, value)

    if (resetPage) next.set("page", "1")
    setParams(next, { replace: true })
  }

  const reload = () =>
    dispatch(fetchTowers(query))
      .unwrap()
      .then(() => undefined)

  const activeFilterCount = [search, status !== "all" ? status : ""].filter(
    Boolean,
  ).length

  const columns: DataTableColumn<TowerListItem>[] = [
    {
      id: "name",
      header: "Tower",
      cell: (tower) => (
        <div className="flex min-w-44 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{tower.name}</p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              {tower.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "floors",
      header: "Floors",
      cell: (tower) => (
        <Badge variant="outline" className="gap-1.5">
          <Layers3 aria-hidden="true" className="size-3.5" />
          {tower.numberOfFloors}
        </Badge>
      ),
    },
    {
      id: "flats",
      header: "Total flats",
      cell: (tower) => tower.totalFlats.toLocaleString("en-IN"),
    },
    {
      id: "average",
      header: "Avg. flats / floor",
      cell: (tower) =>
        (tower.totalFlats / tower.numberOfFloors).toLocaleString("en-IN", {
          maximumFractionDigits: 1,
        }),
      hideOnMobile: true,
    },
    {
      id: "created",
      header: "Added",
      cell: (tower) => formatDate(tower.createdAt),
      hideOnMobile: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (tower) => <StatusBadge status={tower.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (tower) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`View ${tower.name}`}
            render={<Link to={`${ROUTES.TOWERS}/${tower.id}`} />}
          >
            <Eye aria-hidden="true" />
          </Button>
          <TowerActions
            tower={tower}
            variant="dropdown"
            onDeleted={() => void reload()}
          />
        </div>
      ),
    },
  ]

  const addAction: ReactNode = (
    <Button render={<Link to={`${ROUTES.TOWERS}/new`} />}>
      <Plus aria-hidden="true" />
      Add tower
    </Button>
  )

  if (error && !towers.length) {
    return (
      <ErrorState
        title="Unable to load towers"
        description={error}
        onRetry={reload}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Towers"
        description={`${pagination.total.toLocaleString("en-IN")} tower records`}
        icon={<Building2 className="size-5" />}
        actions={addAction}
      />

      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => updateParam("search", value)}
            placeholder="Search tower name or description"
          />
        }
        filters={
          <FilterSelect
            value={status}
            onValueChange={(value) => updateParam("status", value)}
            options={statusOptions}
            placeholder="Status"
            allLabel="All statuses"
            icon={<SlidersHorizontal />}
          />
        }
        sort={
          <SortSelect
            value={sort}
            onValueChange={(value) => updateParam("sort", value)}
            options={sortOptions}
          />
        }
        activeFilterCount={activeFilterCount}
        onClearFilters={() =>
          setParams({ page: "1", sort }, { replace: true })
        }
      />

      <DataTable
        data={towers}
        columns={columns}
        getRowId={(tower) => tower.id}
        loading={listLoading && !towers.length}
        emptyTitle="No towers found"
        emptyDescription="Change the search or filters, or add a new tower."
        emptyAction={addAction}
        onRowClick={(tower) => navigate(`${ROUTES.TOWERS}/${tower.id}`)}
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
