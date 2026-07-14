import { Megaphone } from "lucide-react"
import { useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import type { RootState } from "@/app/root-reducer"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { AnnouncementForm } from "@/features/announcements/components/announcement-form"
import type { AnnouncementFormValues } from "@/features/announcements/schemas/announcement.schema"
import { clearAnnouncement, fetchAnnouncement, updateAnnouncement, type AnnouncementsState } from "@/features/announcements/store/announcements.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { announcements: AnnouncementsState }
export function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch(); const navigate = useNavigate(); const state = useAppSelector((root) => (root as State).announcements); const item = state.selected?.id === id ? state.selected : null
  const role = useAppSelector((root) => root.auth.user?.role)
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  useEffect(() => { dispatch(clearAnnouncement()); if (!id) return; void dispatch(fetchAnnouncement(id)) }, [dispatch, id])
  if (!canManage) return <Navigate to={ROUTES.FORBIDDEN} replace />
  if (state.detailsLoading) return <LoadingState label="Loading announcement..." className="py-20" />
  if (!item || !id) return <ErrorState title="Announcement not found" description={state.error ?? "This announcement cannot be edited."} />
  const initial: AnnouncementFormValues = { title: item.title, summary: item.summary, content: item.content, category: item.category, audience: item.audience, status: item.status, expiresAt: item.expiresAt?.slice(0, 10) ?? "" }
  const submit = async (values: AnnouncementFormValues) => { try { await dispatch(updateAnnouncement({ id, data: values })).unwrap(); toast.success("Announcement updated."); navigate(`${ROUTES.ANNOUNCEMENTS}/${id}`, { replace: true }) } catch (error) { toast.error(typeof error === "string" ? error : "Announcement could not be updated.") } }
  return <div className="space-y-6"><PageHeader title="Edit announcement" description={item.title} icon={<Megaphone className="size-5" />} /><Card><CardContent className="p-4 sm:p-6"><AnnouncementForm mode="edit" initialValues={initial} submitting={state.mutationLoading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div>
}
