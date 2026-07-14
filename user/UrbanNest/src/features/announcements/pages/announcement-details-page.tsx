import { CalendarDays, Megaphone, Pin, Users } from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import type { RootState } from "@/app/root-reducer"
import { ContentCard } from "@/components/common/content-card"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { AnnouncementActions } from "@/features/announcements/components/announcement-actions"
import { AnnouncementStatusBadge } from "@/features/announcements/components/announcement-status-badge"
import { clearAnnouncement, fetchAnnouncement, type AnnouncementsState } from "@/features/announcements/store/announcements.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { announcements: AnnouncementsState }
const format = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not set"

export function AnnouncementDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const state = useAppSelector((root) => (root as State).announcements)
  const item = state.selected?.id === id ? state.selected : null
  useEffect(() => { dispatch(clearAnnouncement()); if (!id) return; const request = dispatch(fetchAnnouncement(id)); return () => { request.abort(); dispatch(clearAnnouncement()) } }, [dispatch, id])
  if (state.detailsLoading) return <LoadingState label="Loading announcement..." className="py-20" />
  if (!item || state.error) return <ErrorState title="Announcement not found" description={state.error ?? "This announcement is unavailable."} backAction={<Button variant="outline" render={<Link to={ROUTES.ANNOUNCEMENTS} />}>Back to announcements</Button>} />
  return <div className="space-y-6">
    <PageHeader title={item.title} description={item.summary} icon={<Megaphone className="size-5" />} badge={<AnnouncementStatusBadge status={item.status} />} actions={<AnnouncementActions announcement={item} onDeleted={() => navigate(ROUTES.ANNOUNCEMENTS, { replace: true })} />} />
    {item.pinned ? <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary"><Pin className="size-4" />Pinned for the community</div> : null}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
      <ContentCard title="Announcement" description="Published community message"><article className="whitespace-pre-wrap break-words text-sm leading-7">{item.content}</article></ContentCard>
      <div className="space-y-6">
        <ContentCard compact title="Audience" icon={<Users className="size-5" />}><p className="capitalize font-medium">{item.audience}</p><p className="mt-1 text-sm capitalize text-muted-foreground">{item.category} announcement</p></ContentCard>
        <ContentCard compact title="Timeline" icon={<CalendarDays className="size-5" />}><dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Published</dt><dd className="font-medium">{format(item.publishedAt)}</dd></div><div><dt className="text-muted-foreground">Expires</dt><dd className="font-medium">{format(item.expiresAt)}</dd></div><div><dt className="text-muted-foreground">Last updated</dt><dd className="font-medium">{format(item.updatedAt)}</dd></div></dl></ContentCard>
      </div>
    </div>
  </div>
}
