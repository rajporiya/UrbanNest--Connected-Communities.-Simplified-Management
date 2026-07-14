import { useEffect, useMemo, useState } from "react"
import { CheckCheck, PhoneCall, ShieldAlert, Siren } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { ContentCard } from "@/components/common/content-card"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/table/data-table"
import { SearchInput } from "@/components/table/search-input"
import { FilterSelect } from "@/components/table/filter-select"
import { SortSelect } from "@/components/table/sort-select"
import { TableToolbar } from "@/components/table/table-toolbar"
import { TablePagination } from "@/components/table/table-pagination"
import { ROLES } from "@/constants/roles.constants"
import { EmergencyStatusBadge } from "@/features/emergency/components/emergency-status-badge"
import { SosForm } from "@/features/emergency/components/sos-form"
import {
  closeEmergency,
  createEmergencyAlert,
  fetchEmergencyAlerts,
  respondToEmergency,
} from "@/features/emergency/store/emergency.slice"
import type { EmergencyState } from "@/features/emergency/store/emergency.slice"
import type {
  EmergencyAlert,
  EmergencySort,
  EmergencyStatus,
  EmergencyType,
} from "@/features/emergency/types/emergency.types"
import type { EmergencyFormValues } from "@/features/emergency/schemas/emergency.schema"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  emergency: EmergencyState
  auth: AuthState
}
export function EmergencyPage() {
  const dispatch = useAppDispatch()
  const { items, pagination, loading, mutating, error } = useSelector(
    (state: State) => state.emergency
  )
  const user = useSelector((state: State) => state.auth.user)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [sort, setSort] = useState<EmergencySort>("priority")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [action, setAction] = useState<{
    kind: "respond" | "close"
    alert: EmergencyAlert
  } | null>(null)
  useEffect(() => {
    void dispatch(
      fetchEmergencyAlerts({
        search,
        status: status ? (status as EmergencyStatus) : undefined,
        type: type ? (type as EmergencyType) : undefined,
        sort,
        page,
        limit,
        residentId: user?.role === ROLES.RESIDENT ? user.id : undefined,
      })
    )
  }, [dispatch, search, status, type, sort, page, limit, user?.id, user?.role])
  const columns = useMemo<DataTableColumn<EmergencyAlert>[]>(
    () => [
      {
        id: "resident",
        header: "Resident",
        cell: (row) => (
          <div>
            <p className="font-semibold">{row.residentName}</p>
            <p className="text-xs text-muted-foreground">
              {row.tower} · {row.flatNumber}
            </p>
          </div>
        ),
      },
      {
        id: "emergency",
        header: "Emergency",
        cell: (row) => (
          <div className="max-w-sm">
            <p className="font-medium capitalize">{row.type}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.message}
            </p>
          </div>
        ),
      },
      {
        id: "time",
        header: "Raised",
        cell: (row) =>
          new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.createdAt)),
        hideOnMobile: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <EmergencyStatusBadge status={row.status} />,
      },
      {
        id: "action",
        header: <span className="sr-only">Actions</span>,
        cell: (row) =>
          user?.role === ROLES.SECURITY_GUARD ? (
            row.status === "pending" ? (
              <Button
                size="sm"
                onClick={() => setAction({ kind: "respond", alert: row })}
              >
                <PhoneCall />
                Respond
              </Button>
            ) : row.status === "responded" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAction({ kind: "close", alert: row })}
              >
                <CheckCheck />
                Close
              </Button>
            ) : null
          ) : null,
      },
    ],
    [user?.role]
  )
  const submit = async (values: EmergencyFormValues) => {
    await dispatch(
      createEmergencyAlert({
        input: values,
        resident: {
          id: user?.id ?? "mock-resident",
          name: user ? `${user.firstName} ${user.lastName}` : "Resident",
          tower: "Tower A",
          flatNumber: "A-1204",
        },
      })
    ).unwrap()
    toast.success("SOS sent to security and the committee")
  }
  const confirm = async () => {
    if (!action) return
    if (action.kind === "respond")
      await dispatch(
        respondToEmergency({
          id: action.alert.id,
          responder: user
            ? `${user.firstName} ${user.lastName}`
            : "Security desk",
        })
      ).unwrap()
    else await dispatch(closeEmergency(action.alert.id)).unwrap()
    toast.success(
      action.kind === "respond" ? "Emergency acknowledged" : "Emergency closed"
    )
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={
          user?.role === ROLES.RESIDENT
            ? "Emergency SOS"
            : user?.role === ROLES.SECURITY_GUARD
              ? "Emergency alerts"
              : "Emergency history"
        }
        description={
          user?.role === ROLES.RESIDENT
            ? "Send a priority alert to society security and committee members."
            : "Monitor, acknowledge, and resolve resident emergencies."
        }
        icon={
          user?.role === ROLES.SECURITY_GUARD ? (
            <ShieldAlert className="size-5" />
          ) : (
            <Siren className="size-5" />
          )
        }
      />
      {user?.role === ROLES.RESIDENT && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)]">
          <ContentCard
            title="Request immediate help"
            description="Your tower and flat details are included automatically."
            icon={<Siren className="size-5" />}
          >
            <SosForm submitting={mutating} onSubmit={submit} />
          </ContentCard>
          <ContentCard title="What happens next?">
            <ol className="space-y-4 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">1. Alert sent</strong>
                <p>Security and committee responders receive your location.</p>
              </li>
              <li>
                <strong className="text-foreground">
                  2. Response acknowledged
                </strong>
                <p>The first responder marks the alert as responded.</p>
              </li>
              <li>
                <strong className="text-foreground">3. Incident closed</strong>
                <p>The record remains available in your history.</p>
              </li>
            </ol>
          </ContentCard>
        </div>
      )}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {user?.role === ROLES.RESIDENT
            ? "My SOS history"
            : "Emergency records"}
        </h2>
        <TableToolbar
          search={
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search resident, flat or details"
            />
          }
          filters={
            <>
              <FilterSelect
                value={status}
                onValueChange={(value) =>
                  setStatus(value === "all" ? "" : value)
                }
                options={["pending", "responded", "closed"].map((value) => ({
                  label: value,
                  value,
                }))}
                placeholder="Status"
              />
              <FilterSelect
                value={type}
                onValueChange={(value) => setType(value === "all" ? "" : value)}
                options={[
                  "medical",
                  "fire",
                  "security",
                  "accident",
                  "other",
                ].map((value) => ({ label: value, value }))}
                placeholder="Type"
              />
            </>
          }
          sort={
            <SortSelect
              value={sort}
              onValueChange={(value) => setSort(value as EmergencySort)}
              options={[
                { label: "Needs attention", value: "priority" },
                { label: "Newest", value: "newest" },
                { label: "Oldest", value: "oldest" },
              ]}
            />
          }
        />
        <DataTable
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading && !items.length}
          emptyTitle="No emergency alerts"
          emptyDescription={error ?? "Emergency records will appear here."}
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
      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action?.kind === "respond"
            ? "Acknowledge emergency?"
            : "Close emergency?"
        }
        description={
          action
            ? `${action.alert.residentName}, ${action.alert.tower} ${action.alert.flatNumber}. ${action.alert.message}`
            : ""
        }
        confirmLabel={
          action?.kind === "respond" ? "Respond now" : "Close incident"
        }
        loading={mutating}
        icon={<Siren />}
        onConfirm={confirm}
      />
    </div>
  )
}
