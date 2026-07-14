import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, Clock, LoaderCircle, MapPin, Users } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { CharacterCounter } from "@/components/forms/character-counter"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import { eventFormSchema, type EventFormValues } from "@/features/events/schemas/event.schema"
import { cn } from "@/utils/cn"

export interface EventFormProps { mode: "create" | "edit"; initialValues: EventFormValues; submitting?: boolean; onSubmit: (values: EventFormValues) => void | Promise<void>; onCancel: () => void }
const control = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
const ErrorText = ({ message }: { message?: string }) => message ? <p role="alert" className="text-xs font-medium text-destructive">{message}</p> : null

export function EventForm({ mode, initialValues, submitting = false, onSubmit, onCancel }: EventFormProps) {
  const form = useForm<EventFormValues>({ resolver: zodResolver(eventFormSchema), defaultValues: initialValues }); const errors = form.formState.errors; const description = useWatch({ control: form.control, name: "description" })
  return <form noValidate className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
    <FormSection title="Event details" description="Add a clear event name, audience, and publishing status." icon={<CalendarDays />} columns={2} divider>
      <div className="space-y-1.5 sm:col-span-2"><RequiredLabel htmlFor="event-title" required>Event title</RequiredLabel><input id="event-title" className={control} maxLength={120} placeholder="Community event name" {...form.register("title")} /><ErrorText message={errors.title?.message} /></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-category" required>Category</RequiredLabel><select id="event-category" className={control} {...form.register("category")}><option value="community">Community</option><option value="cultural">Cultural</option><option value="sports">Sports</option><option value="meeting">Meeting</option><option value="workshop">Workshop</option></select></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-audience" required>Audience</RequiredLabel><select id="event-audience" className={control} {...form.register("audience")}><option value="all">Everyone</option><option value="residents">Residents</option><option value="committee">Committee</option></select></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-status" required>Status</RequiredLabel><select id="event-status" className={control} {...form.register("status")}><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-capacity" required>Capacity</RequiredLabel><div className="relative"><Users className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="event-capacity" type="number" min={1} className={cn(control, "pl-10")} {...form.register("capacity", { valueAsNumber: true })} /></div><ErrorText message={errors.capacity?.message} /></div>
    </FormSection>
    <FormSection title="Schedule and venue" description="Set when and where residents should arrive." icon={<MapPin />} columns={2} divider>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-date" required>Date</RequiredLabel><input id="event-date" type="date" className={control} {...form.register("eventDate")} /><ErrorText message={errors.eventDate?.message} /></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-venue" required>Venue</RequiredLabel><input id="event-venue" className={control} placeholder="Community Hall" {...form.register("venue")} /><ErrorText message={errors.venue?.message} /></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-start" required>Start time</RequiredLabel><div className="relative"><Clock className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="event-start" type="time" className={cn(control, "pl-10")} {...form.register("startTime")} /></div></div>
      <div className="space-y-1.5"><RequiredLabel htmlFor="event-end" required>End time</RequiredLabel><div className="relative"><Clock className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="event-end" type="time" className={cn(control, "pl-10")} {...form.register("endTime")} /></div><ErrorText message={errors.endTime?.message} /></div>
    </FormSection>
    <FormSection title="Description" description="Explain what attendees can expect." icon={<CalendarDays />}><div className="space-y-1.5"><RequiredLabel htmlFor="event-description" required>Description</RequiredLabel><textarea id="event-description" rows={7} maxLength={2000} className={cn(control, "h-auto resize-y py-3")} placeholder="Event programme, eligibility, and useful preparation details" {...form.register("description")} /><div className="flex justify-between gap-3"><ErrorText message={errors.description?.message} /><CharacterCounter current={description.length} max={2000} /></div></div></FormSection>
    <FormActions className="border-t border-border pt-5"><Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" /> : <CalendarDays />}{submitting ? "Saving..." : mode === "create" ? "Create event" : "Save changes"}</Button></FormActions>
  </form>
}
