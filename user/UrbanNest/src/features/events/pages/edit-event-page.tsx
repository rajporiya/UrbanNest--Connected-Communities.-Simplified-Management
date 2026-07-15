import { CalendarDays } from "lucide-react"
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
import { EventForm } from "@/features/events/components/event-form"
import type { EventFormValues } from "@/features/events/schemas/event.schema"
import { clearSelectedEvent, fetchEvent, updateEvent, type EventsState } from "@/features/events/store/events.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { events: EventsState }
export function EditEventPage() { const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch(); const navigate = useNavigate(); const state = useAppSelector((root) => (root as State).events); const role = useAppSelector((root) => root.auth.user?.role); const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER; const event = state.selected?.id === id ? state.selected : null; useEffect(() => { dispatch(clearSelectedEvent()); if (id) void dispatch(fetchEvent(id)) }, [dispatch, id]); if (!canManage) return <Navigate to={ROUTES.FORBIDDEN} replace />; if (state.detailsLoading) return <LoadingState label="Loading event..." className="py-20" />; if (!event || !id) return <ErrorState title="Event not found" description={state.error ?? "This event cannot be edited."} />; const initial: EventFormValues = { title: event.title, description: event.description, category: event.category, audience: event.audience, venue: event.venue, eventDate: event.eventDate, startTime: event.startTime, endTime: event.endTime, capacity: event.capacity, status: event.status }; const submit = async (values: EventFormValues) => { try { await dispatch(updateEvent({ id, data: values })).unwrap(); toast.success("Event updated."); navigate(`${ROUTES.EVENTS}/${id}`, { replace: true }) } catch (error) { toast.error(typeof error === "string" ? error : "Event could not be updated.") } }; return <div className="space-y-6"><PageHeader title="Edit event" description={event.title} icon={<CalendarDays className="size-5" />} /><Card><CardContent className="p-4 sm:p-6"><EventForm mode="edit" initialValues={initial} submitting={state.mutationLoading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div> }
