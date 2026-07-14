import { Vote } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import type { RootState } from "@/app/root-reducer"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar } from "@/components/table"
import { PollCard } from "@/features/polls/components/poll-card"
import { fetchPolls, type PollsState } from "@/features/polls/store/polls.slice"
import type { PollCategory, PollListQuery, PollSort, PollStatus } from "@/features/polls/types/poll.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { polls: PollsState }
const statuses = [{ label: "Open", value: "open" }, { label: "Upcoming", value: "upcoming" }, { label: "Closed", value: "closed" }]
const categories = [{ label: "Community", value: "community" }, { label: "Finance", value: "finance" }, { label: "Facilities", value: "facilities" }, { label: "Events", value: "events" }, { label: "Policy", value: "policy" }]
const sorts = [{ label: "Ending soon", value: "ending_soon" }, { label: "Newest", value: "newest" }, { label: "Most votes", value: "most_votes" }]

export function PollsPage() {
  const dispatch = useAppDispatch(); const [params, setParams] = useSearchParams(); const state = useAppSelector((root) => (root as State).polls)
  const page = Math.max(1, Number(params.get("page")) || 1); const limit = Math.max(1, Number(params.get("limit")) || 10); const search = params.get("search") ?? ""; const status = params.get("status") ?? "all"; const category = params.get("category") ?? "all"; const sort = params.get("sort") ?? "ending_soon"
  const query = useMemo<PollListQuery>(() => ({ page, limit, search: search || undefined, status: status === "all" ? undefined : status as PollStatus, category: category === "all" ? undefined : category as PollCategory, sort: sort as PollSort }), [page, limit, search, status, category, sort])
  useEffect(() => { void dispatch(fetchPolls(query)) }, [dispatch, query])
  const update = (key: string, value: string, reset = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (reset) next.set("page", "1"); setParams(next, { replace: true }) }
  const reload = () => dispatch(fetchPolls(query)).unwrap().then(() => undefined)
  if (state.error && !state.items.length) return <ErrorState title="Unable to load polls" description={state.error} onRetry={reload} />
  return <div className="space-y-6"><PageHeader title="Polls & voting" description={`${state.pagination.total.toLocaleString("en-IN")} community decisions and surveys`} icon={<Vote className="size-5" />} />
    <TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search polls" />} filters={<><FilterSelect value={status} onValueChange={(value) => update("status", value)} options={statuses} placeholder="Status" allLabel="All statuses" /><FilterSelect value={category} onValueChange={(value) => update("category", value)} options={categories} placeholder="Category" allLabel="All categories" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sorts} />} activeFilterCount={[search, status !== "all" && status, category !== "all" && category].filter(Boolean).length} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} />
    {state.listLoading && !state.items.length ? <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />)}<span className="sr-only">Loading polls</span></div> : state.items.length ? <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">{state.items.map((poll) => <PollCard key={poll.id} poll={poll} />)}</div> : <div className="rounded-xl border border-dashed border-border p-10 text-center"><Vote className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No polls found</h2><p className="mt-1 text-sm text-muted-foreground">Try changing the search or filters.</p></div>}
    <TablePagination page={state.pagination.page} totalPages={state.pagination.totalPages} totalItems={state.pagination.total} pageSize={state.pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={state.listLoading} />
  </div>
}
