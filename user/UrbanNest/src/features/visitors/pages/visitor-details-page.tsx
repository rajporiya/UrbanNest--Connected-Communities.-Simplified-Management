import { useEffect, useState } from "react"
import {
  CalendarDays,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { ContentCard } from "@/components/common/content-card"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { QrPreview } from "@/features/visitors/components/qr-preview"
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge"
import {
  cancelVisitorPass,
  checkInVisitor,
  checkOutVisitor,
  fetchVisitorDetails,
} from "@/features/visitors/store/visitors.slice"
import type { VisitorsState } from "@/features/visitors/store/visitors.slice"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  visitors: VisitorsState
  auth: AuthState
}
export function VisitorDetailsPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { selected, loading, mutating, error } = useSelector(
    (state: State) => state.visitors
  )
  const role = useSelector((state: State) => state.auth.user?.role)
  const [confirm, setConfirm] = useState<"in" | "out" | "cancel" | null>(null)
  useEffect(() => {
    if (id) void dispatch(fetchVisitorDetails(id))
  }, [dispatch, id])
  if (loading && !selected)
    return <LoadingState label="Loading visitor pass..." />
  if (!selected || selected.id !== id)
    return (
      <ErrorState
        title="Visitor pass not found"
        description={error ?? "This visitor pass is unavailable."}
        backAction={
          <Button variant="outline" render={<Link to={ROUTES.VISITORS} />}>
            Back to visitors
          </Button>
        }
      />
    )
  const act = async () => {
    if (!confirm) return
    if (confirm === "in") await dispatch(checkInVisitor(selected.id)).unwrap()
    else if (confirm === "out")
      await dispatch(checkOutVisitor(selected.id)).unwrap()
    else await dispatch(cancelVisitorPass(selected.id)).unwrap()
    toast.success(
      confirm === "in"
        ? "Visitor checked in"
        : confirm === "out"
          ? "Visitor checked out"
          : "Visitor pass cancelled"
    )
  }
  const security = role === ROLES.SECURITY_GUARD
  return (
    <div className="space-y-6">
      <PageHeader
        title={selected.visitorName}
        description={`Visitor pass ${selected.qrCode}`}
        badge={<VisitorStatusBadge status={selected.status} />}
        icon={<UserRound className="size-5" />}
        actions={
          <>
            {security && selected.status === "expected" && (
              <Button onClick={() => setConfirm("in")}>
                <LogIn />
                Check in
              </Button>
            )}
            {security && selected.status === "checked-in" && (
              <Button onClick={() => setConfirm("out")}>
                <LogOut />
                Check out
              </Button>
            )}
            {role === ROLES.RESIDENT && selected.status === "expected" && (
              <Button
                variant="destructive"
                onClick={() => setConfirm("cancel")}
              >
                <Trash2 />
                Cancel pass
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <ContentCard title="Visit">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Resident</dt>
                <dd className="font-medium">{selected.residentName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-medium">
                  {selected.tower} · {selected.flatNumber}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Purpose</dt>
                <dd className="font-medium capitalize">
                  {selected.purpose} — {selected.purposeNote}
                </dd>
              </div>
            </dl>
          </ContentCard>
          <ContentCard title="Schedule">
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                {selected.visitDate}, {selected.validFrom}–{selected.validUntil}
              </div>
              <div className="flex gap-2">
                <Phone className="size-4 text-muted-foreground" />
                {selected.mobile}
              </div>
              <div className="flex gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                {selected.vehicleNumber ?? "No vehicle"}
              </div>
              {selected.verifiedBy && (
                <div className="flex gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  Verified by {selected.verifiedBy}
                </div>
              )}
            </dl>
          </ContentCard>
        </div>
        <ContentCard title="Entry QR" description="Scan at the security desk.">
          <QrPreview value={selected.qrCode} />
        </ContentCard>
      </div>
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm === "in"
            ? "Check in visitor?"
            : confirm === "out"
              ? "Check out visitor?"
              : "Cancel visitor pass?"
        }
        description="This action updates the visitor log immediately."
        confirmLabel={
          confirm === "in"
            ? "Check in"
            : confirm === "out"
              ? "Check out"
              : "Cancel pass"
        }
        destructive={confirm === "cancel"}
        loading={mutating}
        onConfirm={act}
      />
    </div>
  )
}
