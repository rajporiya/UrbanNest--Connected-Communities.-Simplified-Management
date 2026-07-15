import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { pollService } from "@/features/polls/services/poll.service"
import type { CastVoteInput, CommunityPoll, PollListQuery, PollListResponse } from "@/features/polls/types/poll.types"

export interface PollsState { items: CommunityPoll[]; selected: CommunityPoll | null; pagination: { page: number; limit: number; total: number; totalPages: number }; listLoading: boolean; detailsLoading: boolean; voting: boolean; error: string | null }
const initialState: PollsState = { items: [], selected: null, pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }, listLoading: false, detailsLoading: false, voting: false, error: null }
type Config = { rejectValue: string }
const message = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
export const fetchPolls = createAsyncThunk<PollListResponse, PollListQuery, Config>("polls/list", async (query, api) => { try { return await pollService.list(query) } catch (error) { return api.rejectWithValue(message(error, "Polls could not be loaded.")) } })
export const fetchPoll = createAsyncThunk<CommunityPoll, string, Config>("polls/details", async (id, api) => { try { return await pollService.get(id) } catch (error) { return api.rejectWithValue(message(error, "Poll could not be loaded.")) } })
export const castPollVote = createAsyncThunk<CommunityPoll, CastVoteInput, Config>("polls/vote", async (input, api) => { try { return await pollService.vote(input) } catch (error) { return api.rejectWithValue(message(error, "Vote could not be submitted.")) } })
const slice = createSlice({ name: "polls", initialState, reducers: { clearSelectedPoll: (state) => { state.selected = null }, clearPollError: (state) => { state.error = null } }, extraReducers: (builder) => {
  builder.addCase(fetchPolls.pending, (state) => { state.listLoading = true; state.error = null }).addCase(fetchPolls.fulfilled, (state, action) => { state.listLoading = false; state.items = action.payload.items; state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, totalPages: action.payload.totalPages } }).addCase(fetchPolls.rejected, (state, action) => { state.listLoading = false; state.error = action.payload ?? "Polls could not be loaded." })
    .addCase(fetchPoll.pending, (state) => { state.detailsLoading = true; state.error = null; state.selected = null }).addCase(fetchPoll.fulfilled, (state, action) => { state.detailsLoading = false; state.selected = action.payload }).addCase(fetchPoll.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload ?? "Poll could not be loaded." })
    .addCase(castPollVote.pending, (state) => { state.voting = true; state.error = null }).addCase(castPollVote.fulfilled, (state, action) => { state.voting = false; state.selected = action.payload; const index = state.items.findIndex((item) => item.id === action.payload.id); if (index >= 0) state.items[index] = action.payload }).addCase(castPollVote.rejected, (state, action) => { state.voting = false; state.error = action.payload ?? "Vote could not be submitted." })
} })
export const { clearSelectedPoll, clearPollError } = slice.actions
export const pollsReducer = slice.reducer
export default slice.reducer
