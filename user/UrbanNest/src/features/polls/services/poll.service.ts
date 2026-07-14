import { mockPolls } from "@/features/polls/data/polls.mock"
import type { CastVoteInput, CommunityPoll, PollListQuery, PollListResponse } from "@/features/polls/types/poll.types"

const store = structuredClone(mockPolls)
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 220))
const clone = <T,>(value: T): T => structuredClone(value)
const indexOf = (id: string) => { const index = store.findIndex((item) => item.id === id); if (index < 0) throw new Error("Poll not found"); return index }
const totalVotes = (poll: CommunityPoll) => poll.options.reduce((total, option) => total + option.votes, 0)
export const pollService = {
  async list(query: PollListQuery = {}): Promise<PollListResponse> { await wait(); const search = query.search?.trim().toLowerCase() ?? ""; const items = store.filter((item) => (!search || `${item.question} ${item.description}`.toLowerCase().includes(search)) && (!query.status || item.status === query.status) && (!query.category || item.category === query.category)); items.sort((left, right) => query.sort === "newest" ? Date.parse(right.createdAt) - Date.parse(left.createdAt) : query.sort === "most_votes" ? totalVotes(right) - totalVotes(left) : Date.parse(left.endsAt) - Date.parse(right.endsAt)); const limit = Math.max(1, query.limit ?? 10); const total = items.length; const totalPages = Math.max(1, Math.ceil(total / limit)); const page = Math.min(Math.max(1, query.page ?? 1), totalPages); return { items: clone(items.slice((page - 1) * limit, page * limit)), total, page, limit, totalPages } },
  async get(id: string) { await wait(); return clone(store[indexOf(id)]) },
  async vote(input: CastVoteInput) { await wait(); const pollIndex = indexOf(input.pollId); const poll = store[pollIndex]; if (poll.status !== "open") throw new Error("Voting is closed for this poll"); if (poll.selectedOptionId) throw new Error("You have already voted in this poll"); const optionIndex = poll.options.findIndex((option) => option.id === input.optionId); if (optionIndex < 0) throw new Error("Poll option not found"); const options = poll.options.map((option, index) => index === optionIndex ? { ...option, votes: option.votes + 1 } : option); store[pollIndex] = { ...poll, options, selectedOptionId: input.optionId }; return clone(store[pollIndex]) },
}
