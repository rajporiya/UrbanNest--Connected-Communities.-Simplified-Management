import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { maintenanceService } from "@/features/maintenance/services/maintenance.service"
import type { ApplyMaintenanceFineRequest, GenerateMaintenanceBillRequest, MaintenanceBill, MaintenanceBillListResponse, MaintenanceBillQuery, UpdateMaintenanceStatusRequest } from "@/features/maintenance/types/maintenance.types"

export interface MaintenanceState {
  bills: MaintenanceBill[]
  selectedBill: MaintenanceBill | null
  query: MaintenanceBillQuery
  pagination: { page: number; limit: number; total: number; totalPages: number }
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  error: string | null
}

const initialState: MaintenanceState = {
  bills: [], selectedBill: null, query: { page: 1, limit: 10 },
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  listLoading: false, detailsLoading: false, mutationLoading: false, error: null,
}

const message = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
export const fetchMaintenanceBills = createAsyncThunk<MaintenanceBillListResponse, MaintenanceBillQuery>("maintenance/list", async (query, { rejectWithValue }) => { try { return await maintenanceService.list(query) } catch (error) { return rejectWithValue(message(error, "Bills could not be loaded.")) } })
export const fetchMaintenanceBill = createAsyncThunk<MaintenanceBill, string>("maintenance/details", async (id, { rejectWithValue }) => { try { return await maintenanceService.details(id) } catch (error) { return rejectWithValue(message(error, "Bill could not be loaded.")) } })
export const generateMaintenanceBill = createAsyncThunk<MaintenanceBill, GenerateMaintenanceBillRequest>("maintenance/generate", async (request, { rejectWithValue }) => { try { return await maintenanceService.generate(request) } catch (error) { return rejectWithValue(message(error, "Bill could not be generated.")) } })
export const applyMaintenanceFine = createAsyncThunk<MaintenanceBill, ApplyMaintenanceFineRequest>("maintenance/fine", async ({ id, amount }, { rejectWithValue }) => { try { return await maintenanceService.applyFine(id, amount) } catch (error) { return rejectWithValue(message(error, "Fine could not be updated.")) } })
export const updateMaintenanceStatus = createAsyncThunk<MaintenanceBill, UpdateMaintenanceStatusRequest>("maintenance/status", async ({ id, status }, { rejectWithValue }) => { try { return await maintenanceService.setStatus(id, status) } catch (error) { return rejectWithValue(message(error, "Status could not be updated.")) } })

const slice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearSelectedMaintenanceBill: (state) => { state.selectedBill = null },
    clearMaintenanceError: (state) => { state.error = null },
    setMaintenanceQuery: (state, action: PayloadAction<MaintenanceBillQuery>) => { state.query = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceBills.pending, (state, action) => { state.listLoading = true; state.error = null; state.query = action.meta.arg })
      .addCase(fetchMaintenanceBills.fulfilled, (state, action) => { state.listLoading = false; state.bills = action.payload.items; state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, totalPages: action.payload.totalPages } })
      .addCase(fetchMaintenanceBills.rejected, (state, action) => { state.listLoading = false; state.error = String(action.payload ?? "Bills could not be loaded.") })
      .addCase(fetchMaintenanceBill.pending, (state) => { state.detailsLoading = true; state.error = null; state.selectedBill = null })
      .addCase(fetchMaintenanceBill.fulfilled, (state, action) => { state.detailsLoading = false; state.selectedBill = action.payload })
      .addCase(fetchMaintenanceBill.rejected, (state, action) => { state.detailsLoading = false; state.error = String(action.payload ?? "Bill could not be loaded.") })
      .addMatcher((action) => [generateMaintenanceBill.pending.type, applyMaintenanceFine.pending.type, updateMaintenanceStatus.pending.type].includes(action.type), (state) => { state.mutationLoading = true; state.error = null })
      .addMatcher((action): action is PayloadAction<MaintenanceBill> => [generateMaintenanceBill.fulfilled.type, applyMaintenanceFine.fulfilled.type, updateMaintenanceStatus.fulfilled.type].includes(action.type), (state, action) => { state.mutationLoading = false; state.selectedBill = action.payload; const index = state.bills.findIndex((bill) => bill.id === action.payload.id); if (index >= 0) state.bills[index] = action.payload; else state.bills.unshift(action.payload) })
      .addMatcher((action) => [generateMaintenanceBill.rejected.type, applyMaintenanceFine.rejected.type, updateMaintenanceStatus.rejected.type].includes(action.type), (state, action) => { state.mutationLoading = false; state.error = String((action as { payload?: unknown }).payload ?? "The change could not be saved.") })
  },
})

export const { clearSelectedMaintenanceBill, clearMaintenanceError, setMaintenanceQuery } = slice.actions
export const maintenanceReducer = slice.reducer
