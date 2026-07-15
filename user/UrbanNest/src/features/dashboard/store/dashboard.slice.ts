import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { UserRole } from "@/constants/roles.constants"
import { dashboardService } from "@/features/dashboard/services/dashboard.service"
import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"

interface DashboardState { data: RoleDashboardResponse | null; role: UserRole | null; loading: boolean; error: string | null; lastFetchedAt: number | null }
const initialState: DashboardState = { data: null, role: null, loading: false, error: null, lastFetchedAt: null }
export const fetchDashboard = createAsyncThunk("dashboard/fetch", async (role: UserRole) => {
  const methods = { committee_head: dashboardService.getCommitteeHeadDashboard, committee_member: dashboardService.getCommitteeMemberDashboard, resident: dashboardService.getResidentDashboard, security_guard: dashboardService.getSecurityDashboard }
  return methods[role]()
}, { condition: (role, { getState }) => { const state = getState() as { dashboard: DashboardState }; return !(state.dashboard.loading || (state.dashboard.role === role && state.dashboard.data && state.dashboard.lastFetchedAt && Date.now() - state.dashboard.lastFetchedAt < 60000)) } })
const slice = createSlice({ name: "dashboard", initialState, reducers: { refreshDashboard: (state) => { state.lastFetchedAt = null }, clearDashboard: () => initialState }, extraReducers: (builder) => builder.addCase(fetchDashboard.pending, (state, action) => { state.loading = true; state.error = null; if (state.role !== action.meta.arg) { state.data = null; state.role = action.meta.arg } }).addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.role = action.payload.role; state.lastFetchedAt = Date.now() }).addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; if (!action.meta.condition) state.error = "Dashboard data could not be loaded." }) })
export const { refreshDashboard, clearDashboard } = slice.actions
export const dashboardReducer = slice.reducer
