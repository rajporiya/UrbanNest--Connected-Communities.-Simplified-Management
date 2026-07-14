export type PollStatus = "upcoming" | "open" | "closed"
export type PollCategory = "community" | "finance" | "facilities" | "events" | "policy"
export type PollSort = "ending_soon" | "newest" | "most_votes"

export interface PollOption { id: string; label: string; votes: number }
export interface CommunityPoll {
  id: string
  question: string
  description: string
  category: PollCategory
  status: PollStatus
  options: PollOption[]
  eligibleVoters: number
  selectedOptionId: string | null
  showResultsBeforeClose: boolean
  startsAt: string
  endsAt: string
  createdBy: string
  createdAt: string
}
export interface PollListQuery { page?: number; limit?: number; search?: string; status?: PollStatus; category?: PollCategory; sort?: PollSort }
export interface PollListResponse { items: CommunityPoll[]; total: number; page: number; limit: number; totalPages: number }
export interface CastVoteInput { pollId: string; optionId: string }
