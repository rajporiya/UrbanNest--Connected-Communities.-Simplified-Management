import { z } from "zod"

export const amenityBookingSchema = z
  .object({
    amenityId: z.enum([
      "gym",
      "club-house",
      "swimming-pool",
      "community-hall",
      "garden",
      "indoor-games",
    ]),
    bookingDate: z.string().min(1, "Select a booking date"),
    slotId: z.string().optional(),
    startTime: z.string().min(1, "Select start time"),
    endTime: z.string().min(1, "Select end time"),
    guests: z.number({ error: "Enter guest count" }).int().min(1).max(150),
    purpose: z.string().trim().min(3, "Add a booking purpose").max(300),
  })
  .refine(
    (data) => {
      const t2m = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        return h * 60 + (m || 0)
      }
      return t2m(data.startTime) < t2m(data.endTime)
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )

export type AmenityBookingFormValues = z.infer<typeof amenityBookingSchema>

export const amenityBookingDefaultValues: AmenityBookingFormValues = {
  amenityId: "gym",
  bookingDate: new Date().toISOString().slice(0, 10),
  slotId: "",
  startTime: "09:00",
  endTime: "11:00",
  guests: 1,
  purpose: "",
}

