import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { notificationService } from "@/features/notifications/services/notification.service"
import type { AppNotification, NotificationListQuery, NotificationListResponse } from "@/features/notifications/types/notification.types"

export interface NotificationsState {
  items: AppNotification[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  unreadCount: number
  loading: boolean
  mutationLoading: boolean
  error: string | null
}
const initialState: NotificationsState = { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }, unreadCount: 0, loading: false, mutationLoading: false, error: null }
const errorMessage = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
type Config = { rejectValue: string }
export const fetchNotifications = createAsyncThunk<NotificationListResponse, NotificationListQuery, Config>("notifications/list", async (query, api) => { try { return await notificationService.list(query) } catch (error) { return api.rejectWithValue(errorMessage(error, "Notifications could not be loaded.")) } })
export const markNotificationRead = createAsyncThunk<AppNotification, string, Config>("notifications/read", async (id, api) => { try { return await notificationService.markRead(id) } catch (error) { return api.rejectWithValue(errorMessage(error, "Notification could not be updated.")) } })
export const markAllNotificationsRead = createAsyncThunk<void, void, Config>("notifications/readAll", async (_, api) => { try { await notificationService.markAllRead() } catch (error) { return api.rejectWithValue(errorMessage(error, "Notifications could not be updated.")) } })
export const deleteNotification = createAsyncThunk<string, string, Config>("notifications/delete", async (id, api) => { try { return await notificationService.remove(id) } catch (error) { return api.rejectWithValue(errorMessage(error, "Notification could not be deleted.")) } })

const slice = createSlice({
  name: "notifications", initialState,
  reducers: { clearNotificationError: (state) => { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.items; state.unreadCount = action.payload.unread; state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, totalPages: action.payload.totalPages } })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Notifications could not be loaded." })
      .addCase(markNotificationRead.fulfilled, (state, action) => { state.mutationLoading = false; const index = state.items.findIndex((item) => item.id === action.payload.id); if (index >= 0 && !state.items[index].read) { state.items[index] = action.payload; state.unreadCount = Math.max(0, state.unreadCount - 1) } })
      .addCase(markAllNotificationsRead.fulfilled, (state) => { state.mutationLoading = false; state.items.forEach((item) => { item.read = true }); state.unreadCount = 0 })
      .addCase(deleteNotification.fulfilled, (state, action) => { state.mutationLoading = false; const item = state.items.find((entry) => entry.id === action.payload); if (item && !item.read) state.unreadCount = Math.max(0, state.unreadCount - 1); state.items = state.items.filter((entry) => entry.id !== action.payload); state.pagination.total = Math.max(0, state.pagination.total - 1) })
      .addMatcher((action) => [markNotificationRead.pending.type, markAllNotificationsRead.pending.type, deleteNotification.pending.type].includes(action.type), (state) => { state.mutationLoading = true; state.error = null })
      .addMatcher((action) => [markNotificationRead.rejected.type, markAllNotificationsRead.rejected.type, deleteNotification.rejected.type].includes(action.type), (state, action) => { state.mutationLoading = false; state.error = (action.payload as string | undefined) ?? "Notification action failed." })
  },
})
export const { clearNotificationError } = slice.actions
export const notificationsReducer = slice.reducer
export default slice.reducer
