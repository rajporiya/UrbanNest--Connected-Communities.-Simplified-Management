import { CalendarDays, Camera, MapPin, Users } from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import type { RootState } from "@/app/root-reducer"
import { ContentCard } from "@/components/common/content-card"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { EventActions } from "@/features/events/components/event-actions"
import { EventRsvp } from "@/features/events/components/event-rsvp"
import { EventStatusBadge } from "@/features/events/components/event-status-badge"
import { clearSelectedEvent, fetchEvent, type EventsState } from "@/features/events/store/events.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { events: EventsState }
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(`${value}T00:00:00`))
export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch(); const navigate = useNavigate(); const state = useAppSelector((root) => (root as State).events); const event = state.selected?.id === id ? state.selected : null
  useEffect(() => { dispatch(clearSelectedEvent()); if (!id) return; const request = dispatch(fetchEvent(id)); return () => { request.abort(); dispatch(clearSelectedEvent()) } }, [dispatch, id])
  if (state.detailsLoading) return <LoadingState label="Loading event..." className="py-20" />
  if (!event || state.error) return <ErrorState title="Event not found" description={state.error ?? "This event is unavailable."} backAction={<Button variant="outline" render={<Link to={ROUTES.EVENTS} />}>Back to events</Button>} />
  const rsvpClosed = ["completed", "cancelled", "draft"].includes(event.status)
  return <div className="space-y-6"><PageHeader title={event.title} description={`${formatDate(event.eventDate)} · ${event.venue}`} icon={<CalendarDays className="size-5" />} badge={<EventStatusBadge status={event.status} />} actions={<EventActions event={event} onDeleted={() => navigate(ROUTES.EVENTS, { replace: true })} />} />
    <div className="grid gap-4 sm:grid-cols-3"><ContentCard compact title="Schedule" icon={<CalendarDays className="size-5" />}><p className="font-semibold">{formatDate(event.eventDate)}</p><p className="mt-1 text-sm text-muted-foreground">{event.startTime} – {event.endTime}</p></ContentCard><ContentCard compact title="Venue" icon={<MapPin className="size-5" />}><p className="font-semibold">{event.venue}</p><p className="mt-1 text-sm capitalize text-muted-foreground">{event.category}</p></ContentCard><ContentCard compact title="Attendance" icon={<Users className="size-5" />}><p className="text-2xl font-bold">{event.attendeeCount}<span className="text-base font-normal text-muted-foreground"> / {event.capacity}</span></p><p className="mt-1 text-sm text-muted-foreground">{event.interestedCount} interested</p></ContentCard></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]"><ContentCard title="About this event" description={`Organized by ${event.organizer}`}><p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{event.description}</p></ContentCard><ContentCard title="Your RSVP" description={rsvpClosed ? "RSVP is not available for this event." : "Let the organizer know your plans."}><EventRsvp event={event} disabled={state.mutationLoading || rsvpClosed} /></ContentCard></div>
    <ContentCard title="Event gallery" description="Photos shared after the event will appear here." icon={<Camera className="size-5" />}>{event.gallery.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{event.gallery.map((image) => <img key={image} src={image} alt="Event gallery" className="aspect-video rounded-xl object-cover" />)}</div> : <EmptyState compact icon={<Camera />} title="Gallery coming soon" description="No photos have been added to this event yet." />}</ContentCard>
  </div>
}
