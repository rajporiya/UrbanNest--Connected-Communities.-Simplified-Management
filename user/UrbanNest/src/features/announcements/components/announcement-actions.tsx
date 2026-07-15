import { Pencil, Pin, PinOff, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { deleteAnnouncement, toggleAnnouncementPin } from "@/features/announcements/store/announcements.slice"
import type { Announcement } from "@/features/announcements/types/announcement.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export interface AnnouncementActionsProps {
  announcement: Announcement
  compact?: boolean
  onDeleted?: () => void
}

export function AnnouncementActions({ announcement, compact = false, onDeleted }: AnnouncementActionsProps) {
  const dispatch = useAppDispatch()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const role = useAppSelector((state) => state.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER

  const togglePin = async () => {
    try {
      await dispatch(toggleAnnouncementPin(announcement.id)).unwrap()
      toast.success(announcement.pinned ? "Announcement unpinned." : "Announcement pinned.")
    } catch (error) { toast.error(typeof error === "string" ? error : "Pin status could not be changed.") }
  }

  const remove = async () => {
    await dispatch(deleteAnnouncement(announcement.id)).unwrap()
    toast.success("Announcement deleted.")
    onDeleted?.()
  }

  if (!canManage) return null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size={compact ? "icon-xs" : "sm"} variant="outline" aria-label={`Edit ${announcement.title}`} render={<Link to={`${ROUTES.ANNOUNCEMENTS}/${announcement.id}/edit`} />}><Pencil />{compact ? null : "Edit"}</Button>
        <Button size={compact ? "icon-xs" : "sm"} variant="outline" aria-label={announcement.pinned ? "Unpin announcement" : "Pin announcement"} onClick={() => void togglePin()}>{announcement.pinned ? <PinOff /> : <Pin />}{compact ? null : announcement.pinned ? "Unpin" : "Pin"}</Button>
        <Button size={compact ? "icon-xs" : "sm"} variant="destructive" aria-label={`Delete ${announcement.title}`} onClick={() => setConfirmingDelete(true)}><Trash2 />{compact ? null : "Delete"}</Button>
      </div>
      <ConfirmDialog open={confirmingDelete} onOpenChange={setConfirmingDelete} destructive title="Delete announcement?" description={`“${announcement.title}” will be permanently removed from the mock announcement store.`} confirmLabel="Delete announcement" icon={<Trash2 />} onConfirm={remove} />
    </>
  )
}
