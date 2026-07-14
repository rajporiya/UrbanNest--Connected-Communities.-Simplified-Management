import { Eye, Megaphone, Pin, Plus } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { UserIdentity } from "@/components/common/user-identity"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar, type DataTableColumn } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { AnnouncementActions } from "@/features/announcements/components/announcement-actions"
import { AnnouncementStatusBadge } from "@/features/announcements/components/announcement-status-badge"
import { fetchAnnouncements, type AnnouncementsState } from "@/features/announcements/store/announcements.slice"
import type { Announcement, AnnouncementCategory, AnnouncementListQuery, AnnouncementSort, AnnouncementStatus } from "@/features/announcements/types/announcement.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import type { RootState } from "@/app/root-reducer"

type State = RootState & { announcements: AnnouncementsState }
const statusOptions = [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]
const categoryOptions = [{ label: "General", value: "general" }, { label: "Maintenance", value: "maintenance" }, { label: "Event", value: "event" }, { label: "Emergency", value: "emergency" }]
const sortOptions = [{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }, { label: "Title A–Z", value: "title_asc" }, { label: "Title Z–A", value: "title_desc" }]
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not published"

export function AnnouncementsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const state = useAppSelector((root) => (root as State).announcements)
  const role = useAppSelector((root) => root.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  const page = Math.max(1, Number(params.get("page")) || 1)
  const limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? ""
  const status = params.get("status") ?? "all"
  const category = params.get("category") ?? "all"
  const sort = params.get("sort") ?? "newest"
  const query = useMemo<AnnouncementListQuery>(() => ({ page, limit, search: search || undefined, status: status === "all" ? undefined : status as AnnouncementStatus, category: category === "all" ? undefined : category as AnnouncementCategory, sort: sort as AnnouncementSort }), [page, limit, search, status, category, sort])

  useEffect(() => { void dispatch(fetchAnnouncements(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }
  const reload = () => dispatch(fetchAnnouncements(query)).unwrap().then(() => undefined)

  const columns: DataTableColumn<Announcement>[] = [
    { id: "title", header: "Announcement", cell: (item) => <div className="min-w-56"><div className="flex items-center gap-2"><p className="max-w-72 truncate font-semibold">{item.title}</p>{item.pinned ? <Pin aria-label="Pinned" className="size-3.5 shrink-0 text-primary" /> : null}</div><p className="mt-1 max-w-80 truncate text-xs text-muted-foreground">{item.summary}</p></div> },
    { id: "category", header: "Category", cell: (item) => <Badge variant="outline" className="capitalize">{item.category}</Badge> },
    { id: "audience", header: "Audience", cell: (item) => <span className="capitalize">{item.audience}</span>, hideOnMobile: true },
    { id: "author", header: "Author", cell: (item) => <UserIdentity name={item.author.name} primaryText={item.author.role} avatarSize="sm" />, hideOnMobile: true },
    { id: "published", header: "Published", cell: (item) => date(item.publishedAt), hideOnMobile: true },
    { id: "status", header: "Status", cell: (item) => <AnnouncementStatusBadge status={item.status} /> },
    { id: "actions", header: "Actions", headerClassName: "text-right", className: "text-right", cell: (item) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon-xs" aria-label={`View ${item.title}`} render={<Link to={`${ROUTES.ANNOUNCEMENTS}/${item.id}`} />}><Eye /></Button><AnnouncementActions announcement={item} compact onDeleted={() => void reload()} /></div> },
  ]
  const add = canManage ? <Button render={<Link to={`${ROUTES.ANNOUNCEMENTS}/new`} />}><Plus />New announcement</Button> : undefined
  if (state.error && !state.items.length) return <ErrorState title="Unable to load announcements" description={state.error} onRetry={reload} />
  return <div className="space-y-6">
    <PageHeader title="Announcements" description={`${state.pagination.total.toLocaleString("en-IN")} community messages`} icon={<Megaphone className="size-5" />} actions={add} />
    <TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search announcements" />} filters={<><FilterSelect value={status} onValueChange={(value) => update("status", value)} options={statusOptions} placeholder="Status" allLabel="All statuses" /><FilterSelect value={category} onValueChange={(value) => update("category", value)} options={categoryOptions} placeholder="Category" allLabel="All categories" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sortOptions} />} activeFilterCount={[search, status !== "all" && status, category !== "all" && category].filter(Boolean).length} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} />
    <DataTable data={state.items} columns={columns} getRowId={(item) => item.id} loading={state.listLoading && !state.items.length} emptyTitle="No announcements found" emptyDescription="Try another filter or create the first announcement." emptyAction={add} onRowClick={(item) => navigate(`${ROUTES.ANNOUNCEMENTS}/${item.id}`)} />
    <TablePagination page={state.pagination.page} totalPages={state.pagination.totalPages} totalItems={state.pagination.total} pageSize={state.pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={state.listLoading} />
  </div>
}
