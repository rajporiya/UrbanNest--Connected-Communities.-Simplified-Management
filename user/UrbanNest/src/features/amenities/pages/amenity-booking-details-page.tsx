import { useEffect, useState } from "react"
import { CalendarCheck, Clock3, MapPin, Users } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { StatusBadge } from "@/components/common/status-badge"
import { ContentCard } from "@/components/common/content-card"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import {
  fetchAmenityBookingDetails,
  reviewAmenityBooking,
} from "@/features/amenities/store/amenities.slice"
import type { AmenitiesState } from "@/features/amenities/store/amenities.slice"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  amenities: AmenitiesState
  auth: AuthState
}
export function AmenityBookingDetailsPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { selected, loading, mutating, error } = useSelector(
    (state: State) => state.amenities
  )
  const user = useSelector((state: State) => state.auth.user)
  const role = user?.role
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null)
  const [note, setNote] = useState("")
  useEffect(() => {
    if (id) void dispatch(fetchAmenityBookingDetails(id))
  }, [dispatch, id])
  if (loading && !selected) return <LoadingState label="Loading booking..." />
  if (!selected || selected.id !== id)
    return (
      <ErrorState
        title="Booking not found"
        description={error ?? "This amenity booking is unavailable."}
        backAction={
          <Button variant="outline" render={<Link to={ROUTES.AMENITIES} />}>
            Back to amenities
          </Button>
        }
      />
    )
  if (
    role === ROLES.RESIDENT &&
    selected.status !== "approved" &&
    selected.residentId !== user?.id
  )
    return (
      <ErrorState
        title="Booking not available"
        description="Only approved bookings are visible to all residents."
        backAction={
          <Button variant="outline" render={<Link to={ROUTES.AMENITIES} />}>
            Back to amenities
          </Button>
        }
      />
    )
  const review = async () => {
    if (!decision) return
    await dispatch(
      reviewAmenityBooking({ id: selected.id, status: decision, note })
    ).unwrap()
    toast.success(`Booking ${decision}`)
  }
  const canReview =
    role === ROLES.COMMITTEE_HEAD && selected.status === "pending"
  return (
    <div className="space-y-6">
      <PageHeader
        title={selected.amenityName}
        description={`Booking ${selected.id}`}
        badge={<StatusBadge status={selected.status} />}
        icon={<CalendarCheck className="size-5" />}
        actions={
          canReview ? (
            <>
              <Button variant="outline" onClick={() => setDecision("rejected")}>
                Reject
              </Button>
              <Button onClick={() => setDecision("approved")}>Approve</Button>
            </>
          ) : undefined
        }
      />
      {canReview && (
        <ContentCard
          compact
          title="Approval note"
          description="Add context for the resident before approving or rejecting."
        >
          <label className="sr-only" htmlFor="booking-review-note">
            Review note
          </label>
          <textarea
            id="booking-review-note"
            rows={3}
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional review note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </ContentCard>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <ContentCard title="Booking schedule">
          <dl className="space-y-4 text-sm">
            <div className="flex gap-3">
              <CalendarCheck className="size-5 text-primary" />
              <span>
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(
                  new Date(`${selected.bookingDate}T00:00:00`)
                )}
              </span>
            </div>
            <div className="flex gap-3">
              <Clock3 className="size-5 text-primary" />
              <span>
                {selected.slot.label}: {selected.slot.startTime}–
                {selected.slot.endTime}
              </span>
            </div>
            <div className="flex gap-3">
              <Users className="size-5 text-primary" />
              <span>
                {selected.guests} guest{selected.guests === 1 ? "" : "s"}
              </span>
            </div>
          </dl>
        </ContentCard>
        <ContentCard title="Resident & purpose">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Resident</dt>
              <dd className="font-medium">{selected.residentName}</dd>
            </div>
            <div className="flex gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              {selected.tower} · {selected.flatNumber}
            </div>
            <div>
              <dt className="text-muted-foreground">Purpose</dt>
              <dd className="font-medium">{selected.purpose}</dd>
            </div>
            {selected.reviewNote && (
              <div>
                <dt className="text-muted-foreground">Review note</dt>
                <dd>{selected.reviewNote}</dd>
              </div>
            )}
          </dl>
        </ContentCard>
      </div>
      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => !open && setDecision(null)}
        title={`${decision === "approved" ? "Approve" : "Reject"} booking?`}
        description="The resident will see this decision immediately."
        confirmLabel={decision === "approved" ? "Approve" : "Reject"}
        destructive={decision === "rejected"}
        loading={mutating}
        icon={<CalendarCheck />}
        onConfirm={review}
      />
    </div>
  )
}
