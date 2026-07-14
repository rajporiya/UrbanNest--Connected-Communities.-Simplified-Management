import { CalendarDays, Eye, MapPin, Plus, Users } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import type { RootState } from "@/app/root-reducer"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar, type DataTableColumn } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { EventActions } from "@/features/events/components/event-actions"
import { EventStatusBadge } from "@/features/events/components/event-status-badge"
import { fetchEvents, type EventsState } from "@/features/events/store/events.slice"
import type { CommunityEvent, EventCategory, EventListQuery, EventSort, EventStatus } from "@/features/events/types/event.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { events: EventsState }
const statuses = [{ label: "Draft", value: "draft" }, { label: "Upcoming", value: "upcoming" }, { label: "Ongoing", value: "ongoing" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]
const categories = [{ label: "Cultural", value: "cultural" }, { label: "Sports", value: "sports" }, { label: "Community", value: "community" }, { label: "Meeting", value: "meeting" }, { label: "Workshop", value: "workshop" }]
const sorts = [{ label: "Soonest first", value: "soonest" }, { label: "Latest first", value: "latest" }, { label: "Title A–Z", value: "title_asc" }]
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`))
export function EventsPage() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const [params, setParams] = useSearchParams(); const state = useAppSelector((root) => (root as State).events)
  const role = useAppSelector((root) => root.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  const page = Math.max(1, Number(params.get("page")) || 1); const limit = Math.max(1, Number(params.get("limit")) || 10); const search = params.get("search") ?? ""; const status = params.get("status") ?? "all"; const category = params.get("category") ?? "all"; const sort = params.get("sort") ?? "soonest"
  const query = useMemo<EventListQuery>(() => ({ page, limit, search: search || undefined, status: status === "all" ? undefined : status as EventStatus, category: category === "all" ? undefined : category as EventCategory, sort: sort as EventSort }), [page, limit, search, status, category, sort]); useEffect(() => { void dispatch(fetchEvents(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }; const reload = () => dispatch(fetchEvents(query)).unwrap().then(() => undefined)
  const columns: DataTableColumn<CommunityEvent>[] = [
    { id: "event", header: "Event", cell: (item) => <div className="min-w-56"><p className="max-w-72 truncate font-semibold">{item.title}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" />{item.venue}</p></div> },
    { id: "date", header: "Date & time", cell: (item) => <div><p className="font-medium">{formatDate(item.eventDate)}</p><p className="text-xs text-muted-foreground">{item.startTime} – {item.endTime}</p></div> },
    { id: "category", header: "Category", cell: (item) => <Badge variant="outline" className="capitalize">{item.category}</Badge>, hideOnMobile: true },
    { id: "attendees", header: "RSVPs", cell: (item) => <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-muted-foreground" />{item.attendeeCount}/{item.capacity}</span>, hideOnMobile: true },
    { id: "status", header: "Status", cell: (item) => <EventStatusBadge status={item.status} /> },
    { id: "actions", header: "Actions", headerClassName: "text-right", className: "text-right", cell: (item) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon-xs" aria-label={`View ${item.title}`} render={<Link to={`${ROUTES.EVENTS}/${item.id}`} />}><Eye /></Button><EventActions event={item} compact onDeleted={() => void reload()} /></div> },
  ]
  const add = canManage ? <Button render={<Link to={`${ROUTES.EVENTS}/new`} />}><Plus />Create event</Button> : undefined
  if (state.error && !state.items.length) return <ErrorState title="Unable to load events" description={state.error} onRetry={reload} />
  return <div className="space-y-6"><PageHeader title="Events" description={`${state.pagination.total.toLocaleString("en-IN")} community events`} icon={<CalendarDays className="size-5" />} actions={add} /><TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search events or venues" />} filters={<><FilterSelect value={status} onValueChange={(value) => update("status", value)} options={statuses} placeholder="Status" allLabel="All statuses" /><FilterSelect value={category} onValueChange={(value) => update("category", value)} options={categories} placeholder="Category" allLabel="All categories" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sorts} />} activeFilterCount={[search, status !== "all" && status, category !== "all" && category].filter(Boolean).length} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} /><DataTable data={state.items} columns={columns} getRowId={(item) => item.id} loading={state.listLoading && !state.items.length} emptyTitle="No events found" emptyDescription="Try another filter or create a community event." emptyAction={add} onRowClick={(item) => navigate(`${ROUTES.EVENTS}/${item.id}`)} /><TablePagination page={state.pagination.page} totalPages={state.pagination.totalPages} totalItems={state.pagination.total} pageSize={state.pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={state.listLoading} /></div>
}
