import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, Clock3, LoaderCircle } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/features/amenities/components/booking-calendar"
import {
  amenityBookingSchema,
  type AmenityBookingFormValues,
} from "@/features/amenities/schemas/amenity-booking.schema"
import type { Amenity } from "@/features/amenities/types/amenity.types"
import { cn } from "@/utils/cn"
const control =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
export function AmenityBookingForm({
  amenities,
  initialValues,
  submitting = false,
  onSubmit,
  onCancel,
}: {
  amenities: Amenity[]
  initialValues: AmenityBookingFormValues
  submitting?: boolean
  onSubmit: (values: AmenityBookingFormValues) => void | Promise<void>
  onCancel: () => void
}) {
  const form = useForm<AmenityBookingFormValues>({
    resolver: zodResolver(amenityBookingSchema),
    defaultValues: initialValues,
  })
  const selectedId = useWatch({ control: form.control, name: "amenityId" })
  const date = useWatch({ control: form.control, name: "bookingDate" })
  const selectedSlotId = useWatch({ control: form.control, name: "slotId" })
  const selected = amenities.find((item) => item.id === selectedId)
  const [month, setMonth] = useState(() =>
    date ? new Date(`${date}T00:00:00`) : new Date()
  )
  useEffect(() => {
    form.setValue("slotId", "")
  }, [form, selectedId])
  const slots = useMemo(() => selected?.slots ?? [], [selected])
  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSection
        title="Select amenity"
        description="Choose a facility and preferred booking date."
        icon={<CalendarDays />}
        columns={2}
        divider
      >
        <label className="space-y-1.5">
          <RequiredLabel required>Amenity</RequiredLabel>
          <select className={control} {...form.register("amenityId")}>
            {amenities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Guests</RequiredLabel>
          <input
            type="number"
            min={1}
            max={selected?.capacity ?? 150}
            className={control}
            {...form.register("guests", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Capacity: {selected?.capacity ?? 0}
          </p>
        </label>
        <div className="sm:col-span-2 space-y-1.5">
          <RequiredLabel required>Booking Date</RequiredLabel>
          <Controller
            control={form.control}
            name="bookingDate"
            render={({ field }) => (
              <BookingCalendar
                value={field.value}
                onChange={field.onChange}
                month={month}
                onMonthChange={setMonth}
              />
            )}
          />
          {form.formState.errors.bookingDate && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.bookingDate.message}
            </p>
          )}
        </div>
      </FormSection>
      <FormSection
        title="Choose time slot"
        description={
          selected?.requiresApproval
            ? "This amenity requires committee approval."
            : "Available bookings are approved instantly."
        }
        icon={<Clock3 />}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map((slot) => (
            <label
              key={slot.id}
              className={cn(
                "relative cursor-pointer rounded-xl border p-4 transition-colors hover:bg-muted/50",
                selectedSlotId === slot.id &&
                  "border-primary bg-primary/5 ring-1 ring-primary"
              )}
            >
              <input
                type="radio"
                value={slot.id}
                className="sr-only"
                {...form.register("slotId")}
              />
              <span className="block font-medium">{slot.label}</span>
              <span className="text-sm text-muted-foreground">
                {slot.startTime}–{slot.endTime}
              </span>
            </label>
          ))}
        </div>
        {form.formState.errors.slotId && (
          <p className="text-xs text-destructive">
            {form.formState.errors.slotId.message}
          </p>
        )}
        <label className="block space-y-1.5">
          <RequiredLabel required>Purpose</RequiredLabel>
          <textarea
            rows={4}
            className={cn(control, "h-auto py-3")}
            {...form.register("purpose")}
          />
          {form.formState.errors.purpose && (
            <p className="text-xs text-destructive">
              {form.formState.errors.purpose.message}
            </p>
          )}
        </label>
      </FormSection>
      <FormActions>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !selected}>
          {submitting && <LoaderCircle className="animate-spin" />}Request
          booking
        </Button>
      </FormActions>
    </form>
  )
}
