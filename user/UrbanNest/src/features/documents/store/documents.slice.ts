import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { documentService } from "@/features/documents/services/document.service"
import type { DocumentListQuery, DocumentListResponse, SocietyDocument } from "@/features/documents/types/document.types"

export interface DocumentsState { items: SocietyDocument[]; selected: SocietyDocument | null; pagination: { page: number; limit: number; total: number; totalPages: number }; loading: boolean; detailsLoading: boolean; error: string | null }
const initialState: DocumentsState = { items: [], selected: null, pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }, loading: false, detailsLoading: false, error: null }
type Config = { rejectValue: string }
const message = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback
export const fetchDocuments = createAsyncThunk<DocumentListResponse, DocumentListQuery, Config>("documents/list", async (query, api) => { try { return await documentService.list(query) } catch (error) { return api.rejectWithValue(message(error, "Documents could not be loaded.")) } })
export const fetchDocument = createAsyncThunk<SocietyDocument, string, Config>("documents/details", async (id, api) => { try { return await documentService.get(id) } catch (error) { return api.rejectWithValue(message(error, "Document could not be loaded.")) } })
export const recordDocumentDownload = createAsyncThunk<SocietyDocument, string, Config>("documents/download", async (id, api) => { try { return await documentService.recordDownload(id) } catch (error) { return api.rejectWithValue(message(error, "Download could not be started.")) } })
const slice = createSlice({ name: "documents", initialState, reducers: { clearDocumentError: (state) => { state.error = null }, clearSelectedDocument: (state) => { state.selected = null } }, extraReducers: (builder) => {
  builder.addCase(fetchDocuments.pending, (state) => { state.loading = true; state.error = null }).addCase(fetchDocuments.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.items; state.pagination = { page: action.payload.page, limit: action.payload.limit, total: action.payload.total, totalPages: action.payload.totalPages } }).addCase(fetchDocuments.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Documents could not be loaded." })
    .addCase(fetchDocument.pending, (state) => { state.detailsLoading = true; state.error = null }).addCase(fetchDocument.fulfilled, (state, action) => { state.detailsLoading = false; state.selected = action.payload }).addCase(fetchDocument.rejected, (state, action) => { state.detailsLoading = false; state.error = action.payload ?? "Document could not be loaded." })
    .addCase(recordDocumentDownload.fulfilled, (state, action) => { const index = state.items.findIndex((item) => item.id === action.payload.id); if (index >= 0) state.items[index] = action.payload; if (state.selected?.id === action.payload.id) state.selected = action.payload })
} })
export const { clearDocumentError, clearSelectedDocument } = slice.actions
export const documentsReducer = slice.reducer
export default slice.reducer
