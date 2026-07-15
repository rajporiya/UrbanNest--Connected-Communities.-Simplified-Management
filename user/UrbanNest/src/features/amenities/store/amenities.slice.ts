import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { amenityService } from "@/features/amenities/services/amenity.service"
import type {
  Amenity,
  AmenityBooking,
  AmenityBookingInput,
  BookingListQuery,
  BookingListResponse,
  BookingStatus,
} from "@/features/amenities/types/amenity.types"
interface CreatePayload {
  input: AmenityBookingInput
  resident: { id: string; name: string; tower: string; flatNumber: string }
}
interface ReviewPayload {
  id: string
  status: Exclude<BookingStatus, "pending">
  note: string
}
export interface AmenitiesState {
  amenities: Amenity[]
  bookings: AmenityBooking[]
  selected: AmenityBooking | null
  pagination: Omit<BookingListResponse, "items">
  loading: boolean
  mutating: boolean
  error: string | null
}
const initialState: AmenitiesState = {
  amenities: [],
  bookings: [],
  selected: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  mutating: false,
  error: null,
}
const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback
export const fetchAmenities = createAsyncThunk("amenities/catalog", () =>
  amenityService.amenities()
)
export const fetchAmenityBookings = createAsyncThunk(
  "amenities/list",
  async (query: BookingListQuery, { rejectWithValue }) => {
    try {
      return await amenityService.list(query)
    } catch (error) {
      return rejectWithValue(message(error, "Bookings could not be loaded"))
    }
  }
)
export const fetchAmenityBookingDetails = createAsyncThunk(
  "amenities/details",
  async (id: string, { rejectWithValue }) => {
    try {
      return await amenityService.details(id)
    } catch (error) {
      return rejectWithValue(message(error, "Booking could not be loaded"))
    }
  }
)
export const createAmenityBooking = createAsyncThunk(
  "amenities/create",
  async (payload: CreatePayload, { rejectWithValue }) => {
    try {
      return await amenityService.create(payload.input, payload.resident)
    } catch (error) {
      return rejectWithValue(message(error, "Booking could not be created"))
    }
  }
)
export const reviewAmenityBooking = createAsyncThunk(
  "amenities/review",
  async (payload: ReviewPayload, { rejectWithValue }) => {
    try {
      return await amenityService.review(
        payload.id,
        payload.status,
        payload.note
      )
    } catch (error) {
      return rejectWithValue(message(error, "Booking could not be reviewed"))
    }
  }
)
const slice = createSlice({
  name: "amenities",
  initialState,
  reducers: {
    clearAmenityBookingSelection: (state) => {
      state.selected = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.amenities = action.payload
      })
      .addCase(fetchAmenityBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAmenityBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchAmenityBookings.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load bookings")
      })
      .addCase(fetchAmenityBookingDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAmenityBookingDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchAmenityBookingDetails.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? "Unable to load booking")
      })
      .addCase(createAmenityBooking.pending, (state) => {
        state.mutating = true
        state.error = null
      })
      .addCase(createAmenityBooking.fulfilled, (state, action) => {
        state.mutating = false
        state.selected = action.payload
        state.bookings.unshift(action.payload)
      })
      .addCase(createAmenityBooking.rejected, (state, action) => {
        state.mutating = false
        state.error = String(action.payload ?? "Unable to create booking")
      })
      .addCase(reviewAmenityBooking.pending, (state) => {
        state.mutating = true
      })
      .addCase(reviewAmenityBooking.fulfilled, (state, action) => {
        state.mutating = false
        state.selected = action.payload
        const index = state.bookings.findIndex(
          (item) => item.id === action.payload.id
        )
        if (index >= 0) state.bookings[index] = action.payload
      })
      .addCase(reviewAmenityBooking.rejected, (state, action) => {
        state.mutating = false
        state.error = String(action.payload ?? "Unable to review booking")
      })
  },
})
export const { clearAmenityBookingSelection } = slice.actions
export const amenitiesReducer = slice.reducer
