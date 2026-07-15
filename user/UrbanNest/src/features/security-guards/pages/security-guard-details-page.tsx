import { useEffect, useState, type ReactNode } from "react"
import { CalendarCheck2, Clock3, ShieldCheck, UserRoundSearch } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { CopyableText } from "@/components/common/copyable-text"
import { RoleBadge } from "@/components/common/role-badge"
import { StatusBadge } from "@/components/common/status-badge"
import { UserIdentity } from "@/components/common/user-identity"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { SecurityGuardActions } from "@/features/security-guards/components/security-guard-actions"
import {
  clearSelectedSecurityGuard,
  fetchSecurityGuardDetails,
} from "@/features/security-guards/store/security-guards.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import { cn } from "@/lib/utils"

const tabs = ["Overview", "Visitor History", "Shift History", "Attendance"] as const
type GuardDetailsTab = typeof tabs[number]

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))
    : "Ongoing"

const formatDateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "Not recorded"

function EmptyTab({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function ActivityBadge({ value }: { value: string }) {
  const label = value.replaceAll("_", " ")
  return <Badge variant="outline" className="capitalize">{label}</Badge>
}

export function SecurityGuardDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<GuardDetailsTab>("Overview")
  const { selectedSecurityGuard: guard, detailsLoading, error } = useAppSelector(
    (state) => state.securityGuards,
  )

  useEffect(() => {
    dispatch(clearSelectedSecurityGuard())
    if (!id) return
    const request = dispatch(fetchSecurityGuardDetails(id))
    return () => {
      request.abort()
      dispatch(clearSelectedSecurityGuard())
    }
  }, [dispatch, id])

  const reload = () => {
    if (!id) return Promise.resolve()
    return dispatch(fetchSecurityGuardDetails(id)).unwrap().then(() => undefined)
  }

  if (detailsLoading) {
    return <LoadingState label="Loading security guard profile..." className="py-20" />
  }

  if (!id || error || !guard || guard.id !== id) {
    return (
      <ErrorState
        title="Security guard not found"
        description="The requested security guard record does not exist or is no longer available."
        onRetry={id ? reload : undefined}
        backAction={<Button variant="outline" render={<Link to={ROUTES.SECURITY_GUARDS} />}>Back to security guards</Button>}
      />
    )
  }

  const overviewRows: ReadonlyArray<readonly [string, ReactNode]> = [
    ["Employee ID", guard.employeeId],
    ["Email", <CopyableText value={guard.email} />],
    ["Mobile", <CopyableText value={guard.mobile} />],
    ["Gate", guard.gate],
    ["Shift", `${guard.shift.name} · ${guard.shift.startTime}–${guard.shift.endTime}`],
    ["Joining date", formatDate(guard.joiningDate)],
    ["Emergency contact", `${guard.emergencyContact.name} · ${guard.emergencyContact.mobile}`],
    ["Relationship", guard.emergencyContact.relationship],
    ["Created", formatDate(guard.createdAt)],
    ["Last updated", formatDate(guard.updatedAt)],
  ]

  const tabContent: Record<GuardDetailsTab, ReactNode> = {
    Overview: (
      <div className="space-y-5">
        <UserIdentity
          name={guard.fullName}
          imageUrl={guard.profileImageUrl}
          primaryText={guard.email}
          secondaryText={`${guard.employeeId} · ${guard.gate}`}
          badge={<StatusBadge status={guard.status} />}
          avatarSize="lg"
        />
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewRows.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-border p-3">
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="mt-1 min-w-0 break-words text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    ),
    "Visitor History": guard.visitorHistory.length ? (
      <ul className="space-y-3">
        {guard.visitorHistory.map((visit) => (
          <li key={visit.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{visit.visitorName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{visit.purpose} · {visit.gate}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(visit.checkedInAt)} – {formatDateTime(visit.checkedOutAt)}
              </p>
            </div>
            <ActivityBadge value={visit.status} />
          </li>
        ))}
      </ul>
    ) : <EmptyTab>No visitor activity has been recorded for this guard.</EmptyTab>,
    "Shift History": guard.shiftHistory.length ? (
      <ol className="space-y-3">
        {guard.shiftHistory.map((record) => (
          <li key={record.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold">{record.shift.name} · {record.gate}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {record.shift.startTime}–{record.shift.endTime} · {formatDate(record.assignedFrom)} to {formatDate(record.assignedUntil)}
                </p>
              </div>
              {!record.assignedUntil ? <Badge>Current assignment</Badge> : null}
            </div>
            <p className="mt-3 text-sm">{record.changeReason}</p>
          </li>
        ))}
      </ol>
    ) : <EmptyTab>No previous gate or shift assignments are available.</EmptyTab>,
    Attendance: guard.attendance.length ? (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Date</th>
              <th scope="col" className="px-4 py-3 font-semibold">Shift</th>
              <th scope="col" className="px-4 py-3 font-semibold">Clock in</th>
              <th scope="col" className="px-4 py-3 font-semibold">Clock out</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {guard.attendance.map((record) => (
              <tr key={record.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium">{formatDate(record.date)}</td>
                <td className="px-4 py-3">{record.shift.name}</td>
                <td className="px-4 py-3">{record.clockIn ?? "—"}</td>
                <td className="px-4 py-3">{record.clockOut ?? "—"}</td>
                <td className="px-4 py-3"><ActivityBadge value={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <EmptyTab>No attendance records are available.</EmptyTab>,
  }

  const tabIcons = {
    Overview: ShieldCheck,
    "Visitor History": UserRoundSearch,
    "Shift History": Clock3,
    Attendance: CalendarCheck2,
  } satisfies Record<GuardDetailsTab, typeof ShieldCheck>
  const ActiveIcon = tabIcons[activeTab]

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={
          <AppBreadcrumb items={[{ label: "Security guards", href: ROUTES.SECURITY_GUARDS }, { label: guard.fullName }]} />
        }
        title={guard.fullName}
        description={`${guard.employeeId} · ${guard.gate} · ${guard.shift.name} shift`}
        badge={
          <div className="flex flex-wrap gap-2">
            <RoleBadge role={ROLES.SECURITY_GUARD} />
            <StatusBadge status={guard.status} />
          </div>
        }
        icon={<ShieldCheck className="size-5" />}
        actions={
          <SecurityGuardActions
            guard={guard}
            showAssignmentActions
            onActionComplete={() => void reload()}
            onDeleted={() => navigate(ROUTES.SECURITY_GUARDS, { replace: true })}
          />
        }
      />
      <Separator />
      <div className="overflow-x-auto">
        <div role="tablist" aria-label="Security guard information" className="flex min-w-max gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`guard-tab-${tab.toLocaleLowerCase().replaceAll(" ", "-")}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="guard-tab-panel"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-t-lg px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <ContentCard title={activeTab} icon={<ActiveIcon className="size-5" />}>
        <div
          id="guard-tab-panel"
          role="tabpanel"
          aria-labelledby={`guard-tab-${activeTab.toLocaleLowerCase().replaceAll(" ", "-")}`}
        >
          {tabContent[activeTab]}
        </div>
      </ContentCard>
    </div>
  )
}
