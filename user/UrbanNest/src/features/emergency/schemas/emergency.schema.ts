import { z } from "zod"
export const emergencySchema = z.object({
  type: z.enum(["medical", "fire", "security", "accident", "other"]),
  message: z
    .string()
    .trim()
    .min(10, "Describe the emergency in at least 10 characters")
    .max(500),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
})
export type EmergencyFormValues = z.infer<typeof emergencySchema>
export const emergencyDefaultValues: EmergencyFormValues = {
  type: "medical",
  message: "",
  mobile: "",
}
