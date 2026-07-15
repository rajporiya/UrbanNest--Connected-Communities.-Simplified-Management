import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, Eye, MapPin, Plus, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { StatusBadge } from "@/components/common/status-badge"
import { ContentCard } from "@/components/common/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/table/data-table"
import { SearchInput } from "@/components/table/search-input"
import { FilterSelect } from "@/components/table/filter-select"
import { SortSelect } from "@/components/table/sort-select"
import { TableToolbar } from "@/components/table/table-toolbar"
import { TablePagination } from "@/components/table/table-pagination"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import {
  fetchAmenities,
  fetchAmenityBookings,
} from "@/features/amenities/store/amenities.slice"
import type { AmenitiesState } from "@/features/amenities/store/amenities.slice"
import type {
  AmenityBooking,
  BookingSort,
  BookingStatus,
} from "@/features/amenities/types/amenity.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  amenities: AmenitiesState
  auth: AuthState
}
export function AmenitiesPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { amenities, bookings, pagination, loading } = useSelector(
    (state: State) => state.amenities
  )
  const user = useSelector((state: State) => state.auth.user)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState<BookingSort>("date_asc")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  useEffect(() => {
    void dispatch(fetchAmenities())
  }, [dispatch])
  useEffect(() => {
    void dispatch(
      fetchAmenityBookings({
        search,
        status: status ? (status as BookingStatus) : undefined,
        sort,
        page,
        limit,
        viewerResidentId: user?.role === ROLES.RESIDENT ? user.id : undefined,
      })
    )
  }, [dispatch, search, status, sort, page, limit, user?.id, user?.role])
  const columns = useMemo<DataTableColumn<AmenityBooking>[]>(
    () => [
      {
        id: "amenity",
        header: "Amenity",
        cell: (row) => (
          <div>
            <p className="font-medium">{row.amenityName}</p>
            <p className="text-xs text-muted-foreground">{row.purpose}</p>
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
        id: "date",
        header: "Date & slot",
        cell: (row) => (
          <div>
            <p>
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                new Date(`${row.bookingDate}T00:00:00`)
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.slot.startTime}–{row.slot.endTime}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        cell: (row) => (
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link to={`${ROUTES.AMENITIES}/${row.id}`} />}
            aria-label={`View ${row.amenityName} booking`}
          >
            <Eye />
          </Button>
        ),
      },
    ],
    []
  )
  return (
    <div className="space-y-8">
      <PageHeader
        title="Amenity booking"
        description="Discover facilities, reserve time slots, and track approvals."
        icon={<CalendarCheck className="size-5" />}
        actions={
          user?.role === ROLES.RESIDENT ? (
            <Button render={<Link to={`${ROUTES.AMENITIES}/book`} />}>
              <Plus />
              Book amenity
            </Button>
          ) : undefined
        }
      />
      <section aria-labelledby="amenities-heading">
        <h2 id="amenities-heading" className="mb-4 text-lg font-semibold">
          Available amenities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {amenities.map((item) => (
            <ContentCard
              key={item.id}
              compact
              className="overflow-hidden"
              title={item.name}
              description={item.description}
              headerAction={
                user?.role === ROLES.RESIDENT ? (
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <Link
                        to={`${ROUTES.AMENITIES}/book?amenity=${item.id}`}
                      />
                    }
                  >
                    Book
                  </Button>
                ) : undefined
              }
            >
              <div
                className={`mb-4 h-20 rounded-lg bg-gradient-to-br ${item.imageClass}`}
              />
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {item.capacity}
                </span>
              </div>
            </ContentCard>
          ))}
        </div>
      </section>
      <section className="space-y-4" aria-labelledby="booking-history">
        <h2 id="booking-history" className="text-lg font-semibold">
          {user?.role === ROLES.RESIDENT
            ? "My bookings & approved schedule"
            : "Booking approvals"}
        </h2>
        <TableToolbar
          search={
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search amenity, resident or flat"
            />
          }
          filters={
            <FilterSelect
              value={status}
              onValueChange={(value) => setStatus(value === "all" ? "" : value)}
              options={["pending", "approved", "rejected"].map((value) => ({
                label: value,
                value,
              }))}
              placeholder="Status"
            />
          }
          sort={
            <SortSelect
              value={sort}
              onValueChange={(value) => setSort(value as BookingSort)}
              options={[
                { label: "Upcoming first", value: "date_asc" },
                { label: "Latest date", value: "date_desc" },
                { label: "Recently requested", value: "newest" },
              ]}
            />
          }
        />
        <DataTable
          data={bookings}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading && !bookings.length}
          emptyTitle="No bookings found"
          onRowClick={(row) => navigate(`${ROUTES.AMENITIES}/${row.id}`)}
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
      </section>
    </div>
  )
}
