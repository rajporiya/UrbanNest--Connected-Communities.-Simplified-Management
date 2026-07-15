import { Megaphone } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type { RootState } from "@/app/root-reducer"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { AnnouncementForm } from "@/features/announcements/components/announcement-form"
import { announcementFormDefaults, type AnnouncementFormValues } from "@/features/announcements/schemas/announcement.schema"
import { createAnnouncement, type AnnouncementsState } from "@/features/announcements/store/announcements.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { announcements: AnnouncementsState }
export function AddAnnouncementPage() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const loading = useAppSelector((root) => (root as State).announcements.mutationLoading)
  const role = useAppSelector((root) => root.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  const submit = async (values: AnnouncementFormValues) => { try { const item = await dispatch(createAnnouncement(values)).unwrap(); toast.success(values.status === "published" ? "Announcement published." : "Announcement saved."); navigate(`${ROUTES.ANNOUNCEMENTS}/${item.id}`, { replace: true }) } catch (error) { toast.error(typeof error === "string" ? error : "Announcement could not be created.") } }
  if (!canManage) return <Navigate to={ROUTES.FORBIDDEN} replace />
  return <div className="space-y-6"><PageHeader title="Create announcement" description="Share a targeted update with the UrbanNest community." icon={<Megaphone className="size-5" />} /><Card><CardContent className="p-4 sm:p-6"><AnnouncementForm mode="create" initialValues={announcementFormDefaults} submitting={loading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div>
}
