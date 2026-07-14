import { BarChart3, Check } from "lucide-react"
import type { CommunityPoll } from "@/features/polls/types/poll.types"
import { cn } from "@/utils/cn"

export function PollResults({ poll }: { poll: CommunityPoll }) {
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0)
  return <div className="space-y-4" aria-label="Poll results"><div className="flex items-center justify-between gap-3 text-sm"><span className="inline-flex items-center gap-2 font-semibold"><BarChart3 className="size-4 text-primary" />Results</span><span className="text-muted-foreground">{total.toLocaleString("en-IN")} votes · {poll.eligibleVoters.toLocaleString("en-IN")} eligible</span></div>{poll.options.map((option) => { const percentage = total ? Math.round((option.votes / total) * 100) : 0; const selected = poll.selectedOptionId === option.id; return <div key={option.id} className="space-y-1.5"><div className="flex items-center justify-between gap-3 text-sm"><span className={cn("inline-flex items-center gap-1.5", selected && "font-semibold text-primary")}>{selected ? <Check className="size-3.5" /> : null}{option.label}</span><span className="font-semibold tabular-nums">{percentage}% <span className="font-normal text-muted-foreground">({option.votes})</span></span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", selected ? "bg-primary" : "bg-primary/55")} style={{ width: `${percentage}%` }} /></div></div> })}</div>
}
