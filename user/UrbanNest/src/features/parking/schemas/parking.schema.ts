import { z } from "zod"

export const parkingAssignmentSchema = z.object({ slotId: z.string().min(1, "Parking slot is required"), vehicleId: z.string().min(1, "Vehicle is required"), startsAt: z.string().min(1, "Start date is required"), notes: z.string().trim().max(300) })
export type ParkingAssignmentFormValues = z.infer<typeof parkingAssignmentSchema>
export const parkingAssignmentDefaults: ParkingAssignmentFormValues = { slotId: "", vehicleId: "", startsAt: new Date().toISOString().slice(0, 10), notes: "" }

export const guestParkingSchema = z.object({ slotId: z.string().min(1, "Guest slot is required"), guestName: z.string().trim().min(2, "Guest name is required").max(80), flatNumber: z.string().trim().min(1, "Host flat is required").max(20), vehicleNumber: z.string().trim().toUpperCase().regex(/^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/, "Enter a valid vehicle number"), startsAt: z.string().min(1, "Start time is required"), endsAt: z.string().min(1, "End time is required"), notes: z.string().trim().max(300) }).refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), { path: ["endsAt"], message: "End time must be after start time" })
export type GuestParkingFormValues = z.infer<typeof guestParkingSchema>

export const vehicleSchema = z.object({ residentId: z.string().min(1, "Resident is required"), registrationNumber: z.string().trim().toUpperCase().regex(/^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/, "Enter a valid registration number"), make: z.string().trim().min(2).max(40), model: z.string().trim().min(1).max(40), color: z.string().trim().min(2).max(30), type: z.enum(["Car", "Motorcycle", "Scooter"]) })
export type VehicleFormValues = z.infer<typeof vehicleSchema>
