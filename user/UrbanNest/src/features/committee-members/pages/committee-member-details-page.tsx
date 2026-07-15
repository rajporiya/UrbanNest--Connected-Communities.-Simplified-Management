import { useEffect, useState, type ReactNode } from "react"
import {
  Activity,
  CalendarCheck2,
  ClipboardList,
  Edit3,
  History,
  UsersRound,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { CopyableText } from "@/components/common/copyable-text"
import { PriorityBadge } from "@/components/common/priority-badge"
import { RoleBadge } from "@/components/common/role-badge"
import { StatusBadge } from "@/components/common/status-badge"
import { UserAvatar } from "@/components/common/user-avatar"
import { UserIdentity } from "@/components/common/user-identity"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { CommitteeMemberActions } from "@/features/committee-members/components/committee-member-actions"
import {
  clearSelectedCommitteeMember,
  fetchCommitteeMemberDetails,
} from "@/features/committee-members/store/committee-members.slice"
import type { CommitteeMemberDetails } from "@/features/committee-members/types/committee-member.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const tabs = [
  "Overview",
  "Assigned Complaints",
  "Assigned Bookings",
  "Activity Log",
] as const

type CommitteeMemberTab = (typeof tabs)[number]

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  )

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

function OverviewPanel({ member }: { member: CommitteeMemberDetails }) {
  const overview: ReadonlyArray<readonly [string, ReactNode]> = [
    ["Email", <CopyableText value={member.email} />],
    ["Mobile", <CopyableText value={member.mobile} />],
    ["Department", member.department],
    ["Designation", member.designation],
    ["Joined date", formatDate(member.joinedDate)],
    ["Account status", <StatusBadge status={member.status} />],
    ["Created", formatDateTime(member.createdAt)],
    ["Last updated", formatDateTime(member.updatedAt)],
  ]

  return (
    <div className="space-y-6">
      <UserIdentity
        name={member.fullName}
        imageUrl={member.profileImageUrl}
        primaryText={member.email}
        secondaryText={`${member.designation} - ${member.department}`}
        badge={<RoleBadge role={ROLES.COMMITTEE_MEMBER} showIcon={false} />}
        avatarSize="lg"
      />

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overview.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg border border-border p-3">
            <dt className="text-xs font-medium text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 min-w-0 break-words text-sm font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="member-responsibilities-title">
        <h3 id="member-responsibilities-title" className="text-sm font-semibold">
          Assigned responsibilities
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.responsibilities.map((responsibility) => (
            <Badge key={responsibility} variant="outline">
              {responsibility}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}

function ComplaintsPanel({ member }: { member: CommitteeMemberDetails }) {
  if (!member.assignedComplaints.length) {
    return (
      <EmptyState
        compact
        icon={<ClipboardList />}
        title="No assigned complaints"
        description="This committee member does not currently have complaint assignments."
      />
    )
  }

  return (
    <ul className="space-y-3">
      {member.assignedComplaints.map((complaint) => (
        <li key={complaint.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{complaint.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {complaint.category} - Reported by {complaint.residentName}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Assigned {formatDateTime(complaint.assignedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function BookingsPanel({ member }: { member: CommitteeMemberDetails }) {
  if (!member.assignedBookings.length) {
    return (
      <EmptyState
        compact
        icon={<CalendarCheck2 />}
        title="No assigned bookings"
        description="This committee member does not currently have amenity booking reviews."
      />
    )
  }

  return (
    <ul className="space-y-3">
      {member.assignedBookings.map((booking) => (
        <li key={booking.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {booking.amenityName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Requested by {booking.residentName}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(booking.bookingDate)} - {booking.timeSlot}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ActivityPanel({ member }: { member: CommitteeMemberDetails }) {
  if (!member.activityLog.length) {
    return (
      <EmptyState
        compact
        icon={<History />}
        title="No activity yet"
        description="Profile and assignment activity will appear here."
      />
    )
  }

  return (
    <ol className="relative ml-2 space-y-5 border-l border-border pl-6">
      {member.activityLog.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute top-1 -left-[1.82rem] grid size-3 rounded-full border-2 border-background bg-primary" />
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
          <time
            dateTime={item.occurredAt}
            className="mt-1 block text-xs text-muted-foreground"
          >
            {formatDateTime(item.occurredAt)}
          </time>
        </li>
      ))}
    </ol>
  )
}

export function CommitteeMemberDetailsPage() {
  const params = useParams<{
    committeeMemberId?: string
    id?: string
  }>()
  const committeeMemberId = params.committeeMemberId ?? params.id
  const [activeTab, setActiveTab] =
    useState<CommitteeMemberTab>("Overview")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const currentUserRole = useAppSelector((state) => state.auth.user?.role)
  const {
    selectedMember,
    detailsLoading,
    error,
  } = useAppSelector((state) => state.committeeMembers)
  const member =
    selectedMember?.id === committeeMemberId ? selectedMember : null

  useEffect(() => {
    dispatch(clearSelectedCommitteeMember())
    if (!committeeMemberId) return

    const request = dispatch(fetchCommitteeMemberDetails(committeeMemberId))
    return () => {
      request.abort()
      dispatch(clearSelectedCommitteeMember())
    }
  }, [committeeMemberId, dispatch])

  if (currentUserRole !== ROLES.COMMITTEE_HEAD) {
    return (
      <ErrorState
        title="Committee Head access required"
        description="Only the Committee Head can view committee member management profiles."
      />
    )
  }

  if (detailsLoading) {
    return (
      <LoadingState
        label="Loading committee member profile..."
        className="py-20"
      />
    )
  }

  if (!committeeMemberId || error || !member) {
    return (
      <ErrorState
        title="Committee member not found"
        description={
          error ??
          "The requested committee member does not exist or is no longer available."
        }
        onRetry={
          committeeMemberId
            ? () =>
                dispatch(fetchCommitteeMemberDetails(committeeMemberId))
                  .unwrap()
                  .then(() => undefined)
            : undefined
        }
        backAction={
          <Button
            variant="outline"
            render={<Link to={ROUTES.COMMITTEE_MEMBERS} />}
          >
            Back to committee members
          </Button>
        }
      />
    )
  }

  const activePanel =
    activeTab === "Overview" ? (
      <OverviewPanel member={member} />
    ) : activeTab === "Assigned Complaints" ? (
      <ComplaintsPanel member={member} />
    ) : activeTab === "Assigned Bookings" ? (
      <BookingsPanel member={member} />
    ) : (
      <ActivityPanel member={member} />
    )

  const tabIcon =
    activeTab === "Overview" ? (
      <UsersRound className="size-5" />
    ) : activeTab === "Assigned Complaints" ? (
      <ClipboardList className="size-5" />
    ) : activeTab === "Assigned Bookings" ? (
      <CalendarCheck2 className="size-5" />
    ) : (
      <Activity className="size-5" />
    )

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={
          <AppBreadcrumb
            items={[
              { label: "Committee Members", href: ROUTES.COMMITTEE_MEMBERS },
              { label: member.fullName },
            ]}
          />
        }
        title={member.fullName}
        description={`${member.designation} - ${member.department}`}
        badge={
          <div className="flex flex-wrap gap-2">
            <RoleBadge role={ROLES.COMMITTEE_MEMBER} />
            <StatusBadge status={member.status} />
          </div>
        }
        icon={
          <UserAvatar
            name={member.fullName}
            imageUrl={member.profileImageUrl}
            size="lg"
          />
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  to={`${ROUTES.COMMITTEE_MEMBERS}/${member.id}/edit`}
                />
              }
            >
              <Edit3 aria-hidden="true" />
              Edit Member
            </Button>
            <CommitteeMemberActions
              member={member}
              currentUserRole={currentUserRole}
              onActionComplete={(action) => {
                if (action === "remove") {
                  navigate(ROUTES.COMMITTEE_MEMBERS, { replace: true })
                }
              }}
            />
          </div>
        }
      />

      <Separator />

      <div className="overflow-x-auto">
        <div
          role="tablist"
          aria-label="Committee member information"
          className="flex min-w-max gap-1 border-b border-border"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`committee-tab-${tab.toLocaleLowerCase().replaceAll(" ", "-")}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="committee-member-tab-panel"
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "rounded-t-lg border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  : "rounded-t-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ContentCard title={activeTab} icon={tabIcon}>
        <div
          id="committee-member-tab-panel"
          role="tabpanel"
          aria-labelledby={`committee-tab-${activeTab.toLocaleLowerCase().replaceAll(" ", "-")}`}
        >
          {activePanel}
        </div>
      </ContentCard>
    </div>
  )
}

