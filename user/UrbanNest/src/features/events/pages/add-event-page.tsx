import { CalendarDays } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { RootState } from "@/app/root-reducer"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { EventForm } from "@/features/events/components/event-form"
import { eventFormDefaults, type EventFormValues } from "@/features/events/schemas/event.schema"
import { createEvent, type EventsState } from "@/features/events/store/events.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { events: EventsState }
export function AddEventPage() { const dispatch = useAppDispatch(); const navigate = useNavigate(); const loading = useAppSelector((root) => (root as State).events.mutationLoading); const role = useAppSelector((root) => root.auth.user?.role); const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER; const submit = async (values: EventFormValues) => { try { const event = await dispatch(createEvent(values)).unwrap(); toast.success("Event created."); navigate(`${ROUTES.EVENTS}/${event.id}`, { replace: true }) } catch (error) { toast.error(typeof error === "string" ? error : "Event could not be created.") } }; if (!canManage) return <Navigate to={ROUTES.FORBIDDEN} replace />; return <div className="space-y-6"><PageHeader title="Create event" description="Plan a welcoming, well-organized community experience." icon={<CalendarDays className="size-5" />} /><Card><CardContent className="p-4 sm:p-6"><EventForm mode="create" initialValues={eventFormDefaults} submitting={loading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div> }
