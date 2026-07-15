import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { parkingService } from "@/features/parking/services/parking.service"
import type { AssignParkingRequest, CreateVehicleRequest, ParkingAssignment, ParkingListResponse, ParkingQuery, ParkingSlot, ParkingVehicle, RegisterGuestParkingRequest } from "@/features/parking/types/parking.types"

export interface ParkingState { slots: ParkingSlot[]; vehicles: ParkingVehicle[]; history: ParkingAssignment[]; selectedSlot: ParkingSlot | null; query: ParkingQuery; pagination: { page: number; limit: number; total: number; totalPages: number }; listLoading: boolean; detailsLoading: boolean; auxiliaryLoading: boolean; mutationLoading: boolean; error: string | null }
const initialState: ParkingState = { slots: [], vehicles: [], history: [], selectedSlot: null, query: { page: 1, limit: 10 }, pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }, listLoading: false, detailsLoading: false, auxiliaryLoading: false, mutationLoading: false, error: null }
const msg = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
export const fetchParkingSlots = createAsyncThunk<ParkingListResponse, ParkingQuery>("parking/list", async (query, { rejectWithValue }) => { try { return await parkingService.listSlots(query) } catch (error) { return rejectWithValue(msg(error, "Parking slots could not be loaded.")) } })
export const fetchParkingSlot = createAsyncThunk<ParkingSlot, string>("parking/details", async (id, { rejectWithValue }) => { try { return await parkingService.slotDetails(id) } catch (error) { return rejectWithValue(msg(error, "Parking slot could not be loaded.")) } })
export const fetchParkingVehicles = createAsyncThunk<ParkingVehicle[]>("parking/vehicles", async (_, { rejectWithValue }) => { try { return await parkingService.listVehicles() } catch (error) { return rejectWithValue(msg(error, "Vehicles could not be loaded.")) } })
export const fetchParkingHistory = createAsyncThunk<ParkingAssignment[]>("parking/history", async (_, { rejectWithValue }) => { try { return await parkingService.listHistory() } catch (error) { return rejectWithValue(msg(error, "Parking history could not be loaded.")) } })
export const assignParking = createAsyncThunk<ParkingSlot, AssignParkingRequest>("parking/assign", async (request, { rejectWithValue }) => { try { return await parkingService.assign(request) } catch (error) { return rejectWithValue(msg(error, "Parking could not be assigned.")) } })
export const registerGuestParking = createAsyncThunk<ParkingSlot, RegisterGuestParkingRequest>("parking/guest", async (request, { rejectWithValue }) => { try { return await parkingService.registerGuest(request) } catch (error) { return rejectWithValue(msg(error, "Guest parking could not be reserved.")) } })
export const releaseParking = createAsyncThunk<ParkingSlot, string>("parking/release", async (id, { rejectWithValue }) => { try { return await parkingService.release(id) } catch (error) { return rejectWithValue(msg(error, "Parking could not be released.")) } })
export const createParkingVehicle = createAsyncThunk<ParkingVehicle, CreateVehicleRequest>("parking/addVehicle", async (request, { rejectWithValue }) => { try { return await parkingService.addVehicle(request) } catch (error) { return rejectWithValue(msg(error, "Vehicle could not be added.")) } })
const slice = createSlice({
  name: "parking",
  initialState,
  reducers: {
    clearSelectedParkingSlot: (state) => { state.selectedSlot = null },
    clearParkingError: (state) => { state.error = null },
    setParkingQuery: (state, action: PayloadAction<ParkingQuery>) => { state.query = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParkingSlots.pending, (state, action) => {
        state.listLoading = true
        state.error = null
        state.query = action.meta.arg
      })
      .addCase(fetchParkingSlots.fulfilled, (state, action) => {
        state.listLoading = false
        state.slots = action.payload.items
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchParkingSlots.rejected, (state, action) => {
        state.listLoading = false
        state.error = String(action.payload ?? "Parking slots could not be loaded.")
      })
      .addCase(fetchParkingSlot.pending, (state) => {
        state.detailsLoading = true
        state.selectedSlot = null
        state.error = null
      })
      .addCase(fetchParkingSlot.fulfilled, (state, action) => {
        state.detailsLoading = false
        state.selectedSlot = action.payload
      })
      .addCase(fetchParkingSlot.rejected, (state, action) => {
        state.detailsLoading = false
        state.error = String(action.payload ?? "Parking slot could not be loaded.")
      })
      .addCase(fetchParkingVehicles.pending, (state) => {
        state.auxiliaryLoading = true
        state.error = null
      })
      .addCase(fetchParkingVehicles.fulfilled, (state, action) => {
        state.auxiliaryLoading = false
        state.vehicles = action.payload
      })
      .addCase(fetchParkingVehicles.rejected, (state, action) => {
        state.auxiliaryLoading = false
        state.error = String(action.payload ?? "Vehicles could not be loaded.")
      })
      .addCase(fetchParkingHistory.pending, (state) => {
        state.auxiliaryLoading = true
        state.error = null
      })
      .addCase(fetchParkingHistory.fulfilled, (state, action) => {
        state.auxiliaryLoading = false
        state.history = action.payload
      })
      .addCase(fetchParkingHistory.rejected, (state, action) => {
        state.auxiliaryLoading = false
        state.error = String(action.payload ?? "Parking history could not be loaded.")
      })
      .addCase(createParkingVehicle.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.vehicles.unshift(action.payload)
      })
      .addMatcher(
        (action) => [
          assignParking.pending.type,
          registerGuestParking.pending.type,
          releaseParking.pending.type,
          createParkingVehicle.pending.type,
        ].includes(action.type),
        (state) => {
          state.mutationLoading = true
          state.error = null
        },
      )
      .addMatcher(
        (action): action is PayloadAction<ParkingSlot> => [
          assignParking.fulfilled.type,
          registerGuestParking.fulfilled.type,
          releaseParking.fulfilled.type,
        ].includes(action.type),
        (state, action) => {
          state.mutationLoading = false
          state.selectedSlot = action.payload
          const index = state.slots.findIndex((item) => item.id === action.payload.id)
          if (index >= 0) state.slots[index] = action.payload
        },
      )
      .addMatcher(
        (action) => [
          assignParking.rejected.type,
          registerGuestParking.rejected.type,
          releaseParking.rejected.type,
          createParkingVehicle.rejected.type,
        ].includes(action.type),
        (state, action) => {
          state.mutationLoading = false
          state.error = String((action as { payload?: unknown }).payload ?? "Parking update failed.")
        },
      )
  },
})
export const { clearSelectedParkingSlot, clearParkingError, setParkingQuery } = slice.actions
export const parkingReducer = slice.reducer
