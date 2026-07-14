import { CalendarClock, LockKeyhole, ShieldCheck, Users, Vote } from "lucide-react"
import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import type { RootState } from "@/app/root-reducer"
import { ContentCard } from "@/components/common/content-card"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { PollResults } from "@/features/polls/components/poll-results"
import { PollStatusBadge } from "@/features/polls/components/poll-status-badge"
import { PollVote } from "@/features/polls/components/poll-vote"
import { clearSelectedPoll, fetchPoll, type PollsState } from "@/features/polls/store/polls.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

type State = RootState & { polls: PollsState }
const format = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
export function PollDetailsPage() {
  const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch(); const state = useAppSelector((root) => (root as State).polls); const poll = state.selected?.id === id ? state.selected : null
  const role = useAppSelector((root) => root.auth.user?.role)
  useEffect(() => { dispatch(clearSelectedPoll()); if (!id) return; const request = dispatch(fetchPoll(id)); return () => { request.abort(); dispatch(clearSelectedPoll()) } }, [dispatch, id])
  if (state.detailsLoading) return <LoadingState label="Loading poll..." className="py-20" />
  if (!poll || state.error && !poll) return <ErrorState title="Poll not found" description={state.error ?? "This poll is unavailable."} backAction={<Button variant="outline" render={<Link to={ROUTES.POLLS} />}>Back to polls</Button>} />
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0); const isResident = role === ROLES.RESIDENT; const canSeeResults = !isResident || poll.status === "closed" || poll.showResultsBeforeClose || Boolean(poll.selectedOptionId)
  return <div className="space-y-6"><PageHeader title={poll.question} description={poll.description} icon={<Vote className="size-5" />} badge={<PollStatusBadge status={poll.status} />} />
    {poll.status === "closed" ? <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-4"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-muted-foreground" /><div><p className="font-semibold">Voting is closed</p><p className="mt-1 text-sm text-muted-foreground">The final result is available below.</p></div></div> : null}
    <div className="grid gap-4 sm:grid-cols-3"><ContentCard compact title="Voting window" icon={<CalendarClock className="size-5" />}><p className="text-sm"><span className="text-muted-foreground">Starts:</span> {format(poll.startsAt)}</p><p className="mt-1 text-sm"><span className="text-muted-foreground">Ends:</span> {format(poll.endsAt)}</p></ContentCard><ContentCard compact title="Participation" icon={<Users className="size-5" />}><p className="text-2xl font-bold">{totalVotes.toLocaleString("en-IN")}</p><p className="text-sm text-muted-foreground">of {poll.eligibleVoters.toLocaleString("en-IN")} eligible voters</p></ContentCard><ContentCard compact title="Privacy" icon={<ShieldCheck className="size-5" />}><p className="font-semibold">Secret ballot</p><p className="text-sm text-muted-foreground">Individual choices are not shared.</p></ContentCard></div>
    <div className="grid gap-6 xl:grid-cols-2"><ContentCard title={poll.status === "open" && isResident ? "Cast your vote" : "Voting options"} description={poll.status === "open" && isResident ? "Choose carefully. A submitted vote cannot be changed." : isResident ? "Voting is not currently available." : "Voting is available only to resident accounts."}>{poll.status === "open" && isResident ? <PollVote poll={poll} voting={state.voting} /> : <ul className="space-y-2">{poll.options.map((option) => <li key={option.id} className="rounded-xl border border-border p-3 text-sm font-medium">{option.label}</li>)}</ul>}</ContentCard><ContentCard title="Poll results" description={canSeeResults ? "Results update when a vote is recorded." : "Results are hidden until voting closes."}>{canSeeResults ? <PollResults poll={poll} /> : <div className="py-8 text-center"><LockKeyhole className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">Results are private for now</p><p className="mt-1 text-sm text-muted-foreground">Return after {format(poll.endsAt)}.</p></div>}</ContentCard></div>
  </div>
}
