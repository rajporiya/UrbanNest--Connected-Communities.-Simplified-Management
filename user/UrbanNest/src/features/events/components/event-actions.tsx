import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { deleteEvent } from "@/features/events/store/events.slice"
import type { CommunityEvent } from "@/features/events/types/event.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function EventActions({ event, compact = false, onDeleted }: { event: CommunityEvent; compact?: boolean; onDeleted?: () => void }) {
  const dispatch = useAppDispatch(); const [confirming, setConfirming] = useState(false)
  const role = useAppSelector((state) => state.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  const remove = async () => { await dispatch(deleteEvent(event.id)).unwrap(); toast.success("Event deleted."); onDeleted?.() }
  if (!canManage) return null
  return <><div className="flex gap-1"><Button variant="outline" size={compact ? "icon-xs" : "sm"} aria-label={`Edit ${event.title}`} render={<Link to={`${ROUTES.EVENTS}/${event.id}/edit`} />}><Pencil />{compact ? null : "Edit"}</Button><Button variant="destructive" size={compact ? "icon-xs" : "sm"} aria-label={`Delete ${event.title}`} onClick={() => setConfirming(true)}><Trash2 />{compact ? null : "Delete"}</Button></div><ConfirmDialog open={confirming} onOpenChange={setConfirming} destructive title="Delete event?" description={`“${event.title}” and its RSVP data will be removed.`} confirmLabel="Delete event" icon={<Trash2 />} onConfirm={remove} /></>
}
