import { Check, Heart, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitEventRsvp } from "@/features/events/store/events.slice"
import type { CommunityEvent, RsvpResponse } from "@/features/events/types/event.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { cn } from "@/utils/cn"

const choices: { value: RsvpResponse; label: string; icon: typeof Check }[] = [{ value: "going", label: "Going", icon: Check }, { value: "interested", label: "Interested", icon: Heart }, { value: "not_going", label: "Can't go", icon: X }]
export function EventRsvp({ event, disabled = false }: { event: CommunityEvent; disabled?: boolean }) {
  const dispatch = useAppDispatch(); const choose = async (response: RsvpResponse) => { try { await dispatch(submitEventRsvp({ id: event.id, response })).unwrap(); toast.success("Your RSVP has been saved.") } catch (error) { toast.error(typeof error === "string" ? error : "RSVP could not be saved.") } }
  return <div className="flex flex-wrap gap-2" aria-label="RSVP options">{choices.map((choice) => { const Icon = choice.icon; const active = event.myRsvp === choice.value; return <Button key={choice.value} type="button" variant={active ? "default" : "outline"} className={cn(active && "shadow-sm")} disabled={disabled} aria-pressed={active} onClick={() => void choose(choice.value)}><Icon />{choice.label}</Button> })}</div>
}
