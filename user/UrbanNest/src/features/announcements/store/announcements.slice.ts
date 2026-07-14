import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit"

import { announcementService } from "@/features/announcements/services/announcement.service"
import type { Announcement, AnnouncementInput, AnnouncementListQuery, AnnouncementListResponse, UpdateAnnouncementInput } from "@/features/announcements/types/announcement.types"

export interface AnnouncementsState {
  items: Announcement[]
  selected: Announcement | null
  pagination: { page: number; limit: number; total: number; totalPages: number }
  query: AnnouncementListQuery
  listLoading: boolean
  detailsLoading: boolean
  mutationLoading: boolean
  error: string | null
}

const initialState: AnnouncementsState = {
  items: [], selected: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  query: { page: 1, limit: 10, sort: "newest" },
  listLoading: false, detailsLoading: false, mutationLoading: false, error: null,
}

const message = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
type Config = { rejectValue: string }

export const fetchAnnouncements = createAsyncThunk<AnnouncementListResponse, AnnouncementListQuery, Config>("announcements/list", async (query, api) => {
  try { return await announcementService.list(query) } catch (error) { return api.rejectWithValue(message(error, "Announcements could not be loaded.")) }
})
export const fetchAnnouncement = createAsyncThunk<Announcement, string, Config>("announcements/details", async (id, api) => {
  try { return await announcementService.get(id) } catch (error) { return api.rejectWithValue(message(error, "Announcement could not be loaded.")) }
})
export const createAnnouncement = createAsyncThunk<Announcement, AnnouncementInput, Config>("announcements/create", async (input, api) => {
  try { return await announcementService.create(input) } catch (error) { return api.rejectWithValue(message(error, "Announcement could not be created.")) }
})
export const updateAnnouncement = createAsyncThunk<Announcement, { id: string; data: UpdateAnnouncementInput }, Config>("announcements/update", async ({ id, data }, api) => {
  try { return await announcementService.update(id, data) } catch (error) { return api.rejectWithValue(message(error, "Announcement could not be updated.")) }
})
export const deleteAnnouncement = createAsyncThunk<string, string, Config>("announcements/delete", async (id, api) => {
  try { return await announcementService.remove(id) } catch (error) { return api.rejectWithValue(message(error, "Announcement could not be deleted.")) }
})
export const toggleAnnouncementPin = createAsyncThunk<Announcement, string, Config>("announcements/togglePin", async (id, api) => {
  try { return await announcementService.togglePin(id) } catch (error) { return api.rejectWithValue(message(error, "Pin status could not be changed.")) }
})

const slice = createSlice({
  name: "announcements", initialState,
  reducers: {
    clearAnnouncement: (state) => { state.selected = null },
    clearAnnouncementError: (state) => { state.error = null },
    setAnnouncementQuery: (state, action: PayloadAction<AnnouncementListQuery>) => { state.query = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state, action) => { state.listLoading = true; state.error = null; state.query = action.meta.arg })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => { state.listLoading = false; state.items = action.payload.items; state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, totalPages: action.payload.totalPages } })
      .addCase(fetchAnnouncements.rejected, (state, action) => { state.listLoading = false; state.error = action.payload ?? "Announcements could not be loaded." })
      .addCase(fetchAnnouncement.pending, (state) => { state.detailsLoading = true; state.error = null; state.selected = null })
      .addCase(fetchAnnouncement.fulfilled, (state, action) => { state.detailsLoading = false; state.selected = action.payload })
      .addCase(fetchAnnouncement.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload ?? "Announcement could not be loaded." })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => { state.mutationLoading = false; state.items = state.items.filter((item) => item.id !== action.payload); if (state.selected?.id === action.payload) state.selected = null })
      .addMatcher(isAnyOf(createAnnouncement.pending, updateAnnouncement.pending, deleteAnnouncement.pending, toggleAnnouncementPin.pending), (state) => { state.mutationLoading = true; state.error = null })
      .addMatcher(isAnyOf(createAnnouncement.fulfilled, updateAnnouncement.fulfilled, toggleAnnouncementPin.fulfilled), (state, action) => {
        state.mutationLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload; else state.items.unshift(action.payload)
        if (state.selected?.id === action.payload.id || action.type === createAnnouncement.fulfilled.type) state.selected = action.payload
      })
      .addMatcher(isAnyOf(createAnnouncement.rejected, updateAnnouncement.rejected, deleteAnnouncement.rejected, toggleAnnouncementPin.rejected), (state, action) => { state.mutationLoading = false; state.error = action.payload ?? "The action could not be completed." })
  },
})

export const { clearAnnouncement, clearAnnouncementError, setAnnouncementQuery } = slice.actions
export const announcementsReducer = slice.reducer
export default slice.reducer
