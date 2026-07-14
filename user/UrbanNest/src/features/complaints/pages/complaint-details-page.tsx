import { useEffect, useState } from "react"
import { ClipboardCheck, UserRoundCheck } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { ContentCard } from "@/components/common/content-card"
import { PriorityBadge } from "@/components/common/priority-badge"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { complaintAssignees } from "@/features/complaints/data/complaints.mock"
import { ComplaintStatusBadge } from "@/features/complaints/components/complaint-status-badge"
import { ComplaintTimeline } from "@/features/complaints/components/complaint-timeline"
import {
  assignComplaint,
  fetchComplaintDetails,
  updateComplaintStatus,
} from "@/features/complaints/store/complaints.slice"
import type { ComplaintsState } from "@/features/complaints/store/complaints.slice"
import type { ComplaintStatus } from "@/features/complaints/types/complaint.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  complaints: ComplaintsState
  auth: AuthState
}
const control =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
export function ComplaintDetailsPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { selected, loading, mutating, error } = useSelector(
    (state: State) => state.complaints
  )
  const user = useSelector((state: State) => state.auth.user)
  const [assigneeId, setAssigneeId] = useState(complaintAssignees[0].id)
  const [status, setStatus] = useState<ComplaintStatus>("in-progress")
  const [note, setNote] = useState("")
  useEffect(() => {
    if (id) void dispatch(fetchComplaintDetails(id))
  }, [dispatch, id])
  if (loading && !selected) return <LoadingState label="Loading complaint..." />
  if (!selected || selected.id !== id)
    return (
      <ErrorState
        title="Complaint not found"
        description={error ?? "The requested complaint is unavailable."}
        backAction={
          <Button variant="outline" render={<Link to={ROUTES.COMPLAINTS} />}>
            Back to complaints
          </Button>
        }
      />
    )
  const assign = async () => {
    await dispatch(
      assignComplaint({ id: selected.id, assigneeId, note })
    ).unwrap()
    setNote("")
    toast.success("Complaint assigned")
  }
  const update = async () => {
    await dispatch(
      updateComplaintStatus({
        id: selected.id,
        status,
        note,
        actor: user ? `${user.firstName} ${user.lastName}` : undefined,
      })
    ).unwrap()
    setNote("")
    toast.success("Complaint status updated")
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={selected.title}
        description={`${selected.id} · ${selected.tower} ${selected.flatNumber}`}
        badge={
          <div className="flex gap-2">
            <PriorityBadge priority={selected.priority} />
            <ComplaintStatusBadge status={selected.status} />
          </div>
        }
        icon={<ClipboardCheck className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <ContentCard title="Issue details">
            <p className="text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
              {selected.description}
            </p>
            {selected.images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selected.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.name}
                    className="aspect-video rounded-lg border object-cover"
                  />
                ))}
              </div>
            )}
          </ContentCard>
          <ContentCard title="Progress timeline">
            <ComplaintTimeline entries={selected.timeline} />
          </ContentCard>
        </div>
        <div className="space-y-6">
          <ContentCard title="Assignment">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Resident</dt>
                <dd className="font-medium">{selected.residentName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assigned to</dt>
                <dd className="font-medium">
                  {selected.assignedTo ?? "Not assigned"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium capitalize">{selected.category}</dd>
              </div>
            </dl>
          </ContentCard>
          {user?.role === ROLES.COMMITTEE_HEAD && (
            <ContentCard
              title="Assign complaint"
              icon={<UserRoundCheck className="size-5" />}
            >
              <div className="space-y-3">
                <select
                  className={control}
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                >
                  {complaintAssignees.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <textarea
                  className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm"
                  placeholder="Assignment note (optional)"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={mutating}
                  onClick={() => void assign()}
                >
                  Assign complaint
                </Button>
              </div>
            </ContentCard>
          )}
          {user?.role === ROLES.COMMITTEE_MEMBER && (
            <ContentCard title="Update status">
              <div className="space-y-3">
                <select
                  className={control}
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ComplaintStatus)
                  }
                >
                  <option value="in-progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <textarea
                  className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm"
                  placeholder="Required progress note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={mutating || note.trim().length < 3}
                  onClick={() => void update()}
                >
                  Update status
                </Button>
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </div>
  )
}
