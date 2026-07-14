import { ArrowRight, BarChart3, CalendarClock, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { ROLES } from "@/constants/roles.constants"
import { PollStatusBadge } from "@/features/polls/components/poll-status-badge"
import type { CommunityPoll } from "@/features/polls/types/poll.types"
import { useAppSelector } from "@/hooks/use-app-selector"

const format = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
export function PollCard({ poll }: { poll: CommunityPoll }) { const role = useAppSelector((state) => state.auth.user?.role); const canVote = role === ROLES.RESIDENT && poll.status === "open" && !poll.selectedOptionId; const votes = poll.options.reduce((sum, option) => sum + option.votes, 0); return <Card className="flex h-full flex-col transition-transform hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"><CardHeader className="space-y-3"><div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wide text-primary">{poll.category}</span><PollStatusBadge status={poll.status} /></div><div><h2 className="text-lg font-semibold leading-6">{poll.question}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{poll.description}</p></div></CardHeader><CardContent className="mt-auto space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><CalendarClock className="size-4" />{poll.status === "upcoming" ? "Starts" : "Ends"} {format(poll.status === "upcoming" ? poll.startsAt : poll.endsAt)}</p><p className="flex items-center gap-2"><BarChart3 className="size-4" />{votes.toLocaleString("en-IN")} votes</p><p className="flex items-center gap-2"><Users className="size-4" />{poll.eligibleVoters.toLocaleString("en-IN")} eligible residents</p></CardContent><CardFooter><Button className="w-full" variant={canVote ? "default" : "outline"} render={<Link to={`${ROUTES.POLLS}/${poll.id}`} />}>{canVote ? "Vote now" : "View poll"}<ArrowRight /></Button></CardFooter></Card> }
