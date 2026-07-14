import { z } from "zod"

export const eventFormSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(2000),
  category: z.enum(["cultural", "sports", "community", "meeting", "workshop"]),
  audience: z.enum(["all", "residents", "committee"]),
  venue: z.string().trim().min(3).max(120),
  eventDate: z.string().min(1, "Select an event date"),
  startTime: z.string().min(1, "Select a start time"),
  endTime: z.string().min(1, "Select an end time"),
  capacity: z.number().int().min(1).max(10000),
  status: z.enum(["draft", "upcoming", "ongoing", "completed", "cancelled"]),
}).refine((value) => value.startTime < value.endTime, { path: ["endTime"], message: "End time must be later than start time" })
export type EventFormValues = z.infer<typeof eventFormSchema>
export const eventFormDefaults: EventFormValues = { title: "", description: "", category: "community", audience: "all", venue: "", eventDate: "", startTime: "09:00", endTime: "11:00", capacity: 100, status: "draft" }
