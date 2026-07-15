import { useEffect, useMemo, type ReactNode } from "react"
import { Building2, Eye, Layers3, Plus } from "lucide-react"
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
import { FlatActions } from "@/features/flats/components/flat-actions"
import {
  bhkTypeOptions,
  flatTowerOptions,
  occupancyStatusOptions,
} from "@/features/flats/data/flats.mock"
import { fetchFlats } from "@/features/flats/store/flats.slice"
import type {
  FlatBhkType,
  FlatListItem,
  FlatListQuery,
  FlatOccupancyStatus,
  FlatSortOption,
} from "@/features/flats/types/flat.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const sortOptions = [
  { label: "Tower and flat", value: "tower_asc" },
  { label: "Flat number A-Z", value: "flat_asc" },
  { label: "Flat number Z-A", value: "flat_desc" },
  { label: "Lowest floor", value: "floor_asc" },
  { label: "Smallest area", value: "area_asc" },
  { label: "Largest area", value: "area_desc" },
  { label: "Recently added", value: "newest" },
]

const towers = new Set(flatTowerOptions.map((tower) => tower.id))
const bhkTypes = new Set<string>(bhkTypeOptions)
const statuses = new Set<string>(occupancyStatusOptions)
const sorts = new Set(sortOptions.map((option) => option.value))
const floorOptions = Array.from({ length: Math.max(...flatTowerOptions.map((tower) => tower.totalFloors)) + 1 }, (_, floor) => ({
  label: floor === 0 ? "Ground floor" : `Floor ${floor}`,
  value: String(floor),
}))

export function FlatsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { flats, pagination, listLoading, error } = useAppSelector((state) => state.flats)

  const page = Math.max(1, Number(params.get("page")) || 1)
  const limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? ""
  const tower = params.get("tower") ?? "all"
  const floor = params.get("floor") ?? "all"
  const bhk = params.get("bhk") ?? "all"
  const occupancy = params.get("occupancy") ?? "all"
  const sort = params.get("sort") ?? "tower_asc"
  const parsedFloor = /^\d+$/.test(floor) ? Number(floor) : undefined

  const query = useMemo<FlatListQuery>(() => ({
    page,
    limit,
    search: search || undefined,
    towerId: towers.has(tower) ? tower : undefined,
    floorNumber: parsedFloor,
    bhkType: bhkTypes.has(bhk) ? bhk as FlatBhkType : undefined,
    occupancyStatus: statuses.has(occupancy) ? occupancy as FlatOccupancyStatus : undefined,
    sort: sorts.has(sort) ? sort as FlatSortOption : "tower_asc",
  }), [page, limit, search, tower, parsedFloor, bhk, occupancy, sort])

  useEffect(() => {
    void dispatch(fetchFlats(query))
  }, [dispatch, query])

  const updateParam = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(params)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    if (resetPage) next.set("page", "1")
    setParams(next, { replace: true })
  }

  const reload = () => dispatch(fetchFlats(query)).unwrap().then(() => undefined)
  const activeFilterCount = [
    search,
    tower !== "all" ? tower : "",
    floor !== "all" ? floor : "",
    bhk !== "all" ? bhk : "",
    occupancy !== "all" ? occupancy : "",
  ].filter(Boolean).length

  const columns: DataTableColumn<FlatListItem>[] = [
    {
      id: "flat",
      header: "Flat",
      cell: (flat) => (
        <div className="min-w-28">
          <p className="font-semibold text-foreground">{flat.flatNumber}</p>
          <p className="text-xs text-muted-foreground">{flat.tower.name}</p>
        </div>
      ),
    },
    { id: "floor", header: "Floor", cell: (flat) => flat.floorNumber === 0 ? "Ground" : flat.floorNumber },
    { id: "bhk", header: "BHK type", cell: (flat) => <Badge variant="outline">{flat.bhkType}</Badge> },
    { id: "area", header: "Area", cell: (flat) => `${flat.areaSqFt.toLocaleString("en-IN")} sq ft`, hideOnMobile: true },
    {
      id: "owner",
      header: "Owner",
      cell: (flat) => flat.ownerName ?? <span className="text-muted-foreground">Not assigned</span>,
      hideOnMobile: true,
    },
    { id: "occupancy", header: "Occupancy", cell: (flat) => <StatusBadge status={flat.occupancyStatus} /> },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (flat) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`View flat ${flat.flatNumber}`}
            render={<Link to={`${ROUTES.FLATS}/${flat.id}`} />}
          >
            <Eye aria-hidden="true" />
          </Button>
          <FlatActions flat={flat} variant="icons" onDeleted={() => void reload()} />
        </div>
      ),
    },
  ]

  const addAction: ReactNode = (
    <Button render={<Link to={`${ROUTES.FLATS}/new`} />}>
      <Plus aria-hidden="true" />Add flat
    </Button>
  )

  if (error && !flats.length) {
    return <ErrorState title="Unable to load flats" description={error} onRetry={reload} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flats"
        description={`${pagination.total.toLocaleString()} flats across UrbanNest towers`}
        icon={<Building2 className="size-5" />}
        actions={addAction}
      />
      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={(value) => updateParam("search", value)}
            placeholder="Search flat, tower, owner or BHK"
          />
        }
        filters={
          <>
            <FilterSelect
              value={tower}
              onValueChange={(value) => updateParam("tower", value)}
              options={flatTowerOptions.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Tower"
              allLabel="All towers"
              icon={<Building2 />}
            />
            <FilterSelect
              value={floor}
              onValueChange={(value) => updateParam("floor", value)}
              options={floorOptions}
              placeholder="Floor"
              allLabel="All floors"
              icon={<Layers3 />}
            />
            <FilterSelect
              value={bhk}
              onValueChange={(value) => updateParam("bhk", value)}
              options={bhkTypeOptions.map((item) => ({ label: item, value: item }))}
              placeholder="BHK type"
              allLabel="All BHK types"
            />
            <FilterSelect
              value={occupancy}
              onValueChange={(value) => updateParam("occupancy", value)}
              options={occupancyStatusOptions.map((item) => ({
                label: item.charAt(0).toLocaleUpperCase() + item.slice(1),
                value: item,
              }))}
              placeholder="Occupancy"
              allLabel="All occupancy"
            />
          </>
        }
        sort={<SortSelect value={sort} onValueChange={(value) => updateParam("sort", value)} options={sortOptions} />}
        activeFilterCount={activeFilterCount}
        onClearFilters={() => setParams({ page: "1", sort }, { replace: true })}
      />
      <DataTable
        data={flats}
        columns={columns}
        getRowId={(flat) => flat.id}
        loading={listLoading && !flats.length}
        emptyTitle="No flats found"
        emptyDescription="Change the search or filters, or add a new flat."
        emptyAction={addAction}
        onRowClick={(flat) => navigate(`${ROUTES.FLATS}/${flat.id}`)}
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
