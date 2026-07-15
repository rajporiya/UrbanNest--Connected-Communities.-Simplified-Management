import { z } from "zod"

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export const visitorPassSchema = z
  .object({
    visitorName: z.string().trim().min(2, "Visitor name is required").max(80),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    purpose: z.enum(["guest", "delivery", "service", "cab", "other"]),
    purposeNote: z.string().trim().min(3, "Add a short purpose").max(200),
    visitDate: z.string().min(1, "Visit date is required"),
    validFrom: z.string().regex(timePattern, "Start time is required"),
    validUntil: z.string().regex(timePattern, "End time is required"),
    vehicleNumber: z.string().trim().max(20).optional(),
  })
  .refine((value) => value.validUntil > value.validFrom, {
    path: ["validUntil"],
    message: "End time must be after start time",
  })

export type VisitorPassFormValues = z.infer<typeof visitorPassSchema>

export const visitorPassDefaultValues: VisitorPassFormValues = {
  visitorName: "",
  mobile: "",
  purpose: "guest",
  purposeNote: "",
  visitDate: new Date().toISOString().slice(0, 10),
  validFrom: "09:00",
  validUntil: "18:00",
  vehicleNumber: "",
}
