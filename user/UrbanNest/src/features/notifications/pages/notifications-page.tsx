import { Bell, CheckCheck } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import type { RootState } from "@/app/root-reducer"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { FilterSelect, SearchInput, TablePagination, TableToolbar } from "@/components/table"
import { Button } from "@/components/ui/button"
import { NotificationList } from "@/features/notifications/components/notification-list"
import { fetchNotifications, markAllNotificationsRead, type NotificationsState } from "@/features/notifications/store/notifications.slice"
import type { NotificationCategory, NotificationFilter, NotificationListQuery } from "@/features/notifications/types/notification.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { notifications: NotificationsState }
const categoryOptions = [{ label: "Announcements", value: "announcement" }, { label: "Billing", value: "billing" }, { label: "Visitors", value: "visitor" }, { label: "Events", value: "event" }, { label: "Security", value: "security" }, { label: "System", value: "system" }]
const readOptions = [{ label: "Unread", value: "unread" }, { label: "Read", value: "read" }]

export function NotificationsPage() {
  const dispatch = useAppDispatch(); const [params, setParams] = useSearchParams(); const state = useAppSelector((root) => (root as State).notifications)
  const page = Math.max(1, Number(params.get("page")) || 1); const limit = Math.max(1, Number(params.get("limit")) || 10); const search = params.get("search") ?? ""; const filter = params.get("filter") ?? "all"; const category = params.get("category") ?? "all"
  const query = useMemo<NotificationListQuery>(() => ({ page, limit, search: search || undefined, filter: filter as NotificationFilter, category: category === "all" ? undefined : category as NotificationCategory }), [page, limit, search, filter, category])
  useEffect(() => { void dispatch(fetchNotifications(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }
  const reload = () => dispatch(fetchNotifications(query)).unwrap().then(() => undefined)
  const markAll = async () => { try { await dispatch(markAllNotificationsRead()).unwrap(); toast.success("All notifications marked as read.") } catch (error) { toast.error(typeof error === "string" ? error : "Notifications could not be updated.") } }
  if (state.error && !state.items.length) return <ErrorState title="Unable to load notifications" description={state.error} onRetry={reload} />
  return <div className="space-y-6"><PageHeader title="Notifications" description={`${state.unreadCount.toLocaleString("en-IN")} unread of ${state.pagination.total.toLocaleString("en-IN")} shown notifications`} icon={<Bell className="size-5" />} actions={<Button variant="outline" disabled={!state.unreadCount || state.mutationLoading} onClick={() => void markAll()}><CheckCheck />Mark all read</Button>} />
    <TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search notifications" />} filters={<><FilterSelect value={filter} onValueChange={(value) => update("filter", value)} options={readOptions} placeholder="Read status" allLabel="All notifications" /><FilterSelect value={category} onValueChange={(value) => update("category", value)} options={categoryOptions} placeholder="Category" allLabel="All categories" /></>} activeFilterCount={[search, filter !== "all" && filter, category !== "all" && category].filter(Boolean).length} onClearFilters={() => setParams({ page: "1" }, { replace: true })} />
    {state.loading && !state.items.length ? <div role="status" className="space-y-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}<span className="sr-only">Loading notifications</span></div> : <NotificationList notifications={state.items} />}
    <TablePagination page={state.pagination.page} totalPages={state.pagination.totalPages} totalItems={state.pagination.total} pageSize={state.pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={state.loading} />
  </div>
}
