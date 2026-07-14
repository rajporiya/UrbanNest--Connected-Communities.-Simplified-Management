import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Vote } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { voteSchema, type VoteFormValues } from "@/features/polls/schemas/poll.schema"
import { castPollVote } from "@/features/polls/store/polls.slice"
import type { CommunityPoll } from "@/features/polls/types/poll.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import { cn } from "@/utils/cn"

export function PollVote({ poll, voting = false }: { poll: CommunityPoll; voting?: boolean }) {
  const dispatch = useAppDispatch(); const role = useAppSelector((state) => state.auth.user?.role); const [confirming, setConfirming] = useState(false); const form = useForm<VoteFormValues>({ resolver: zodResolver(voteSchema), defaultValues: { optionId: "" } }); const selected = useWatch({ control: form.control, name: "optionId" }); const chosen = poll.options.find((option) => option.id === selected)
  if (role !== ROLES.RESIDENT) return <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">Only resident accounts can vote. You can still review the live results and poll status.</div>
  if (poll.selectedOptionId) return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" />Vote recorded</p><p className="mt-1">You selected {poll.options.find((option) => option.id === poll.selectedOptionId)?.label}.</p></div>
  return <><form className="space-y-4" onSubmit={form.handleSubmit(() => setConfirming(true))}><fieldset className="space-y-2"><legend className="mb-3 text-sm font-semibold">Select one option</legend>{poll.options.map((option) => <label key={option.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors", selected === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40")}><input type="radio" value={option.id} className="size-4 accent-primary" {...form.register("optionId")} /><span className="text-sm font-medium">{option.label}</span></label>)}</fieldset>{form.formState.errors.optionId ? <p role="alert" className="text-xs font-medium text-destructive">{form.formState.errors.optionId.message}</p> : null}<Button type="submit" disabled={voting} className="w-full sm:w-auto"><Vote />Submit vote</Button></form><ConfirmDialog open={confirming} onOpenChange={setConfirming} title="Submit your vote?" description={`You selected “${chosen?.label ?? "this option"}”. Your vote cannot be changed after submission.`} confirmLabel="Confirm vote" icon={<Vote />} onConfirm={async () => { await dispatch(castPollVote({ pollId: poll.id, optionId: form.getValues("optionId") })).unwrap(); toast.success("Your vote has been recorded.") }} /></>
}
