import { useEffect } from "react"
import { CalendarPlus } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { ContentCard } from "@/components/common/content-card"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { ROUTES } from "@/constants/routes.constants"
import { AmenityBookingForm } from "@/features/amenities/components/amenity-booking-form"
import {
  amenityBookingDefaultValues,
  type AmenityBookingFormValues,
} from "@/features/amenities/schemas/amenity-booking.schema"
import {
  createAmenityBooking,
  fetchAmenities,
} from "@/features/amenities/store/amenities.slice"
import type { AmenitiesState } from "@/features/amenities/store/amenities.slice"
import type { AmenityType } from "@/features/amenities/types/amenity.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  amenities: AmenitiesState
  auth: AuthState
}
export function BookAmenityPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { amenities, mutating } = useSelector((state: State) => state.amenities)
  const user = useSelector((state: State) => state.auth.user)
  useEffect(() => {
    if (!amenities.length) void dispatch(fetchAmenities())
  }, [amenities.length, dispatch])
  if (!amenities.length) return <LoadingState label="Loading amenities..." />
  const requested = params.get("amenity") as AmenityType | null
  const initial = {
    ...amenityBookingDefaultValues,
    amenityId:
      amenities.some((item) => item.id === requested) && requested
        ? requested
        : amenities[0].id,
  }
  const submit = async (values: AmenityBookingFormValues) => {
    const booking = await dispatch(
      createAmenityBooking({
        input: values,
        resident: {
          id: user?.id ?? "mock-resident",
          name: user ? `${user.firstName} ${user.lastName}` : "Resident",
          tower: "Tower A",
          flatNumber: "A-1204",
        },
      })
    ).unwrap()
    toast.success(
      booking.status === "approved"
        ? "Booking confirmed"
        : "Booking sent for approval"
    )
    navigate(`${ROUTES.AMENITIES}/${booking.id}`)
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book an amenity"
        description="Pick a facility, date, and available time slot."
        icon={<CalendarPlus className="size-5" />}
      />
      <ContentCard>
        <AmenityBookingForm
          amenities={amenities}
          initialValues={initial}
          submitting={mutating}
          onSubmit={submit}
          onCancel={() => navigate(ROUTES.AMENITIES)}
        />
      </ContentCard>
    </div>
  )
}
