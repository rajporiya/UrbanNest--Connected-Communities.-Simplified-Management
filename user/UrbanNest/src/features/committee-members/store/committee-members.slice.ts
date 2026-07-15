import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type Draft,
  type PayloadAction,
} from "@reduxjs/toolkit"

import { committeeMemberService } from "@/features/committee-members/services/committee-member.service"
import type {
  CommitteeMemberDetails,
  CommitteeMemberListItem,
  CommitteeMemberListQuery,
  CommitteeMemberListResponse,
  CreateCommitteeMemberRequest,
  UpdateCommitteeMemberRequest,
} from "@/features/committee-members/types/committee-member.types"

export type CommitteeMemberMutation =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "demote"

export interface CommitteeMemberPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CommitteeMembersState {
  members: CommitteeMemberListItem[]
  selectedMember: CommitteeMemberDetails | null
  pagination: CommitteeMemberPaginationState
  filters: CommitteeMemberListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  activeMutation: CommitteeMemberMutation | null
  error: string | null
  activeListRequestId: string | null
  activeListQueryKey: string | null
  activeDetailsRequestId: string | null
  activeDetailsMemberId: string | null
}

interface CommitteeMembersRootState {
  committeeMembers: CommitteeMembersState
}

export interface UpdateCommitteeMemberPayload {
  id: string
  data: UpdateCommitteeMemberRequest
}

interface CommitteeMemberThunkConfig {
  state: CommitteeMembersRootState
  rejectValue: string
}

const DEFAULT_PAGE_SIZE = 10

const initialState: CommitteeMembersState = {
  members: [],
  selectedMember: null,
  pagination: {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  },
  listLoading: false,
  detailsLoading: false,
  mutationLoading: false,
  activeMutation: null,
  error: null,
  activeListRequestId: null,
  activeListQueryKey: null,
  activeDetailsRequestId: null,
  activeDetailsMemberId: null,
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return "The committee member request was cancelled."
  }

  if (error instanceof Error && error.message) return error.message
  return "We could not complete the committee member request. Please try again."
}

const getQueryKey = (query: CommitteeMemberListQuery) =>
  JSON.stringify({
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_PAGE_SIZE,
    search: query.search ?? "",
    department: query.department ?? "",
    status: query.status ?? "",
    responsibility: query.responsibility ?? "",
    sort: query.sort ?? "",
  })

const canStartMutation = (_: unknown, { getState }: { getState: () => unknown }) =>
  !(getState() as CommitteeMembersRootState).committeeMembers.mutationLoading

export const fetchCommitteeMembers = createAsyncThunk<
  CommitteeMemberListResponse,
  CommitteeMemberListQuery,
  CommitteeMemberThunkConfig
>(
  "committeeMembers/fetchCommitteeMembers",
  async (query, { rejectWithValue }) => {
    try {
      return await committeeMemberService.getCommitteeMembers(query)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState().committeeMembers
      return !(
        state.listLoading && state.activeListQueryKey === getQueryKey(query)
      )
    },
  },
)

export const fetchCommitteeMemberDetails = createAsyncThunk<
  CommitteeMemberDetails,
  string,
  CommitteeMemberThunkConfig
>(
  "committeeMembers/fetchCommitteeMemberDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await committeeMemberService.getCommitteeMemberById(id)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().committeeMembers
      return !(
        state.detailsLoading && state.activeDetailsMemberId === id
      )
    },
  },
)

export const createCommitteeMember = createAsyncThunk<
  CommitteeMemberDetails,
  CreateCommitteeMemberRequest,
  CommitteeMemberThunkConfig
>(
  "committeeMembers/createCommitteeMember",
  async (data, { rejectWithValue }) => {
    try {
      return await committeeMemberService.createCommitteeMember(data)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  { condition: canStartMutation },
)

export const updateCommitteeMember = createAsyncThunk<
  CommitteeMemberDetails,
  UpdateCommitteeMemberPayload,
  CommitteeMemberThunkConfig
>(
  "committeeMembers/updateCommitteeMember",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await committeeMemberService.updateCommitteeMember(id, data)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  { condition: canStartMutation },
)

function createMemberActionThunk(
  action: Exclude<CommitteeMemberMutation, "create" | "update">,
  serviceAction: (id: string) => Promise<CommitteeMemberDetails>,
) {
  return createAsyncThunk<
    CommitteeMemberDetails,
    string,
    CommitteeMemberThunkConfig
  >(
    `committeeMembers/${action}CommitteeMember`,
    async (id, { rejectWithValue }) => {
      try {
        return await serviceAction(id)
      } catch (error) {
        return rejectWithValue(getSafeErrorMessage(error))
      }
    },
    { condition: canStartMutation },
  )
}

export const deleteCommitteeMember = createMemberActionThunk(
  "delete",
  committeeMemberService.deleteCommitteeMember,
)
export const activateCommitteeMember = createMemberActionThunk(
  "activate",
  committeeMemberService.activateCommitteeMember,
)
export const deactivateCommitteeMember = createMemberActionThunk(
  "deactivate",
  committeeMemberService.deactivateCommitteeMember,
)
export const demoteCommitteeMember = createAsyncThunk<
  CommitteeMemberDetails,
  string,
  CommitteeMemberThunkConfig
>(
  "committeeMembers/demoteCommitteeMember",
  async (id, { rejectWithValue }) => {
    try {
      return await committeeMemberService.demoteCommitteeMemberRole(id)
    } catch (error) {
      return rejectWithValue(getSafeErrorMessage(error))
    }
  },
  { condition: canStartMutation },
)

function updateCachedMember(
  state: Draft<CommitteeMembersState>,
  member: CommitteeMemberDetails,
  selectMember = false,
  addIfMissing = false,
) {
  const memberIndex = state.members.findIndex((item) => item.id === member.id)

  if (memberIndex >= 0) {
    state.members[memberIndex] = member
  } else if (addIfMissing) {
    state.members.unshift(member)
  }

  if (selectMember || state.selectedMember?.id === member.id) {
    state.selectedMember = member
  }
}

function mutationFromActionType(actionType: string): CommitteeMemberMutation {
  if (actionType.includes("createCommitteeMember")) return "create"
  if (actionType.includes("updateCommitteeMember")) return "update"
  if (actionType.includes("deleteCommitteeMember")) return "delete"
  if (actionType.includes("deactivateCommitteeMember")) return "deactivate"
  if (actionType.includes("activateCommitteeMember")) return "activate"
  if (actionType.includes("demoteCommitteeMember")) return "demote"
  return "deactivate"
}

const committeeMembersSlice = createSlice({
  name: "committeeMembers",
  initialState,
  reducers: {
    clearSelectedCommitteeMember: (state) => {
      state.selectedMember = null
      state.detailsLoading = false
      state.activeDetailsRequestId = null
      state.activeDetailsMemberId = null
    },
    clearCommitteeMembersError: (state) => {
      state.error = null
    },
    setCommitteeMemberFilters: (
      state,
      action: PayloadAction<CommitteeMemberListQuery>,
    ) => {
      state.filters = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommitteeMembers.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.filters = action.meta.arg
        state.activeListRequestId = action.meta.requestId
        state.activeListQueryKey = getQueryKey(action.meta.arg)
      })
      .addCase(fetchCommitteeMembers.fulfilled, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.members = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.activeListRequestId = null
        state.activeListQueryKey = null
      })
      .addCase(fetchCommitteeMembers.rejected, (state, action) => {
        if (state.activeListRequestId !== action.meta.requestId) return

        state.listLoading = false
        state.activeListRequestId = null
        state.activeListQueryKey = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Committee members could not be loaded."
        }
      })
      .addCase(fetchCommitteeMemberDetails.pending, (state, action) => {
        state.detailsLoading = true
        state.error = null
        state.activeDetailsRequestId = action.meta.requestId
        state.activeDetailsMemberId = action.meta.arg

        if (state.selectedMember?.id !== action.meta.arg) {
          state.selectedMember = null
        }
      })
      .addCase(fetchCommitteeMemberDetails.fulfilled, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.selectedMember = action.payload
        state.activeDetailsRequestId = null
        state.activeDetailsMemberId = null
        updateCachedMember(state, action.payload)
      })
      .addCase(fetchCommitteeMemberDetails.rejected, (state, action) => {
        if (state.activeDetailsRequestId !== action.meta.requestId) return

        state.detailsLoading = false
        state.activeDetailsRequestId = null
        state.activeDetailsMemberId = null
        if (!action.meta.condition) {
          state.error = action.payload ?? "Committee member details could not be loaded."
        }
      })
      .addMatcher(
        isAnyOf(deleteCommitteeMember.fulfilled, demoteCommitteeMember.fulfilled),
        (state, action) => {
          state.mutationLoading = false
          state.activeMutation = null
          state.members = state.members.filter(
            (member) => member.id !== action.payload.id,
          )
          if (state.selectedMember?.id === action.payload.id) {
            state.selectedMember = null
          }
          state.pagination.total = Math.max(0, state.pagination.total - 1)
          state.pagination.totalPages = Math.max(
            1,
            Math.ceil(state.pagination.total / state.pagination.limit),
          )
        }
      )
      .addMatcher(
        isAnyOf(
          createCommitteeMember.pending,
          updateCommitteeMember.pending,
          deleteCommitteeMember.pending,
          activateCommitteeMember.pending,
          deactivateCommitteeMember.pending,
          demoteCommitteeMember.pending,
        ),
        (state, action) => {
          state.mutationLoading = true
          state.activeMutation = mutationFromActionType(action.type)
          state.error = null
        },
      )
      .addMatcher(
        isAnyOf(
          createCommitteeMember.fulfilled,
          updateCommitteeMember.fulfilled,
          activateCommitteeMember.fulfilled,
          deactivateCommitteeMember.fulfilled,
        ),
        (state, action) => {
          const isNewMember = state.activeMutation === "create"
          state.mutationLoading = false
          state.activeMutation = null
          updateCachedMember(
            state,
            action.payload,
            isNewMember,
            isNewMember,
          )

          if (isNewMember) {
            state.pagination.total += 1
            state.pagination.totalPages = Math.max(
              1,
              Math.ceil(state.pagination.total / state.pagination.limit),
            )
          }
        },
      )
      .addMatcher(
        isAnyOf(
          createCommitteeMember.rejected,
          updateCommitteeMember.rejected,
          deleteCommitteeMember.rejected,
          activateCommitteeMember.rejected,
          deactivateCommitteeMember.rejected,
          demoteCommitteeMember.rejected,
        ),
        (state, action) => {
          if (action.meta.condition) return

          state.mutationLoading = false
          state.activeMutation = null
          state.error =
            action.payload ?? "The committee member could not be updated."
        },
      )
  },
})

export const {
  clearSelectedCommitteeMember,
  clearCommitteeMembersError,
  setCommitteeMemberFilters,
} = committeeMembersSlice.actions

export const committeeMembersReducer = committeeMembersSlice.reducer
