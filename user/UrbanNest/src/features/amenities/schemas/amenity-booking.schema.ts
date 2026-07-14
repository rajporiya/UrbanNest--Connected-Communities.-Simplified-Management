import { z } from "zod"
export const amenityBookingSchema = z.object({
  amenityId: z.enum([
    "gym",
    "club-house",
    "swimming-pool",
    "community-hall",
    "garden",
    "indoor-games",
  ]),
  bookingDate: z.string().min(1, "Select a booking date"),
  slotId: z.string().min(1, "Select a time slot"),
  guests: z.number({ error: "Enter guest count" }).int().min(1).max(150),
  purpose: z.string().trim().min(3, "Add a booking purpose").max(300),
})
export type AmenityBookingFormValues = z.infer<typeof amenityBookingSchema>
export const amenityBookingDefaultValues: AmenityBookingFormValues = {
  amenityId: "gym",
  bookingDate: new Date().toISOString().slice(0, 10),
  slotId: "",
  guests: 1,
  purpose: "",
}
