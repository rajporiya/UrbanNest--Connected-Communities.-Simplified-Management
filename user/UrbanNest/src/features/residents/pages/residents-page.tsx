import { useEffect, type ReactNode } from "react"
import { Eye, Pencil, Plus, SlidersHorizontal, Users } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { StatusBadge } from "@/components/common/status-badge"
import { UserIdentity } from "@/components/common/user-identity"
import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { DataTable, FilterSelect, SearchInput, SortSelect, TablePagination, TableToolbar, type DataTableColumn } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { towerOptions } from "@/features/residents/data/residents.mock"
import { ResidentStatusActions } from "@/features/residents/components/resident-status-actions"
import { fetchResidents } from "@/features/residents/store/residents.slice"
import type { OwnershipType, ResidentAccountStatus, ResidentApprovalStatus, ResidentListItem, ResidentListQuery, ResidentSortOption } from "@/features/residents/types/resident.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const approvalOptions = [{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }]
const accountOptions = [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Blocked", value: "blocked" }]
const ownershipOptions = [{ label: "Owner", value: "owner" }, { label: "Tenant", value: "tenant" }, { label: "Family Member", value: "family_member" }]
const sortOptions = [{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }, { label: "Name A–Z", value: "name_asc" }, { label: "Name Z–A", value: "name_desc" }, { label: "Tower ascending", value: "tower_asc" }, { label: "Flat ascending", value: "flat_asc" }]
const approvals = new Set(approvalOptions.map((option) => option.value)), accounts = new Set(accountOptions.map((option) => option.value)), ownerships = new Set(ownershipOptions.map((option) => option.value)), sorts = new Set(sortOptions.map((option) => option.value))

export function ResidentsPage() {
  const dispatch = useAppDispatch(), navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const role = useAppSelector((state) => state.auth.user?.role)
  const { residents, pagination, listLoading, error } = useAppSelector((state) => state.residents)
  const page = Math.max(1, Number(params.get("page")) || 1), limit = Math.max(1, Number(params.get("limit")) || 10)
  const search = params.get("search") ?? "", approval = params.get("status") ?? "all", account = params.get("account") ?? "all", tower = params.get("tower") ?? "all", ownership = params.get("ownership") ?? "all", sort = params.get("sort") ?? "newest"
  useEffect(() => { const query: ResidentListQuery = { page, limit, search: search || undefined, approvalStatus: approvals.has(approval) ? approval as ResidentApprovalStatus : undefined, accountStatus: accounts.has(account) ? account as ResidentAccountStatus : undefined, tower: tower !== "all" ? tower : undefined, ownershipType: ownerships.has(ownership) ? ownership as OwnershipType : undefined, sort: sorts.has(sort) ? sort as ResidentSortOption : "newest" }; void dispatch(fetchResidents(query)) }, [dispatch, page, limit, search, approval, account, tower, ownership, sort])
  const update = (key: string, value: string, resetPage = true) => { const next = new URLSearchParams(params); if (!value || value === "all") next.delete(key); else next.set(key, value); if (resetPage) next.set("page", "1"); setParams(next, { replace: true }) }
  const activeFilterCount = [search, approval !== "all" ? approval : "", account !== "all" ? account : "", tower !== "all" ? tower : "", ownership !== "all" ? ownership : ""].filter(Boolean).length
  const columns: DataTableColumn<ResidentListItem>[] = [
    { id: "resident", header: "Resident", cell: (resident) => <UserIdentity name={resident.fullName} imageUrl={resident.profileImageUrl} primaryText={resident.email} /> },
    { id: "contact", header: "Contact", cell: (resident) => resident.mobile, hideOnMobile: true },
    { id: "tower", header: "Tower", cell: (resident) => resident.tower.name },
    { id: "flat", header: "Flat", cell: (resident) => resident.flat.number },
    { id: "ownership", header: "Ownership", cell: (resident) => <Badge variant="outline" className="capitalize">{resident.ownershipType.replace("_", " ")}</Badge>, hideOnMobile: true },
    { id: "approval", header: "Approval", cell: (resident) => <StatusBadge status={resident.approvalStatus} /> },
    { id: "account", header: "Account", cell: (resident) => <StatusBadge status={resident.accountStatus} />, hideOnMobile: true },
    { id: "joined", header: "Joined", cell: (resident) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(resident.joinedAt)), hideOnMobile: true },
    { id: "actions", header: "Actions", headerClassName: "text-right", className: "text-right", cell: (resident) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon-xs" aria-label={`View ${resident.fullName}`} render={<Link to={`${ROUTES.RESIDENTS}/${resident.id}`} />}><Eye aria-hidden="true" /></Button>{role === ROLES.COMMITTEE_HEAD ? <><Button variant="ghost" size="icon-xs" aria-label={`Edit ${resident.fullName}`} render={<Link to={`${ROUTES.RESIDENTS}/${resident.id}/edit`} />}><Pencil aria-hidden="true" /></Button><ResidentStatusActions resident={resident} currentUserRole={role} variant="dropdown" /></> : null}</div> },
  ]
  const addAction: ReactNode = role === ROLES.COMMITTEE_HEAD ? <Button render={<Link to={ROUTES.RESIDENT_NEW} />}><Plus aria-hidden="true" />Add Resident</Button> : null
  if (error && !residents.length) return <ErrorState title="Unable to load residents" description={error} onRetry={() => dispatch(fetchResidents({ page, limit })).unwrap().then(() => undefined)} />
  return <div className="space-y-6"><PageHeader title="Residents" description={`${pagination.total.toLocaleString()} resident records`} icon={<Users className="size-5" />} actions={addAction} /><TableToolbar search={<SearchInput value={search} onChange={(value) => update("search", value)} placeholder="Search name, email, mobile, tower or flat" />} filters={<><FilterSelect value={approval} onValueChange={(value) => update("status", value)} options={approvalOptions} placeholder="Approval status" allLabel="All approvals" icon={<SlidersHorizontal />} /><FilterSelect value={account} onValueChange={(value) => update("account", value)} options={accountOptions} placeholder="Account status" allLabel="All accounts" /><FilterSelect value={tower} onValueChange={(value) => update("tower", value)} options={towerOptions.map((item) => ({ label: item.name, value: item.id }))} placeholder="Tower" allLabel="All towers" /><FilterSelect value={ownership} onValueChange={(value) => update("ownership", value)} options={ownershipOptions} placeholder="Ownership" allLabel="All ownership" /></>} sort={<SortSelect value={sort} onValueChange={(value) => update("sort", value)} options={sortOptions} />} activeFilterCount={activeFilterCount} onClearFilters={() => setParams({ page: "1", sort }, { replace: true })} /><DataTable data={residents} columns={columns} getRowId={(resident) => resident.id} loading={listLoading && !residents.length} emptyTitle="No residents found" emptyDescription="Change the search or filters, or add a new resident." emptyAction={addAction} onRowClick={(resident) => navigate(`${ROUTES.RESIDENTS}/${resident.id}`)} /><TablePagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pagination.limit} onPageChange={(value) => update("page", String(value), false)} onPageSizeChange={(value) => update("limit", String(value))} disabled={listLoading} /></div>
}
