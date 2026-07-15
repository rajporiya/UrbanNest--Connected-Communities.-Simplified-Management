import { z } from "zod"

export const complaintFormSchema = z.object({
  title: z.string().trim().min(5, "Use at least 5 characters").max(100),
  description: z
    .string()
    .trim()
    .min(20, "Describe the issue in at least 20 characters")
    .max(1500),
  category: z.enum([
    "maintenance",
    "security",
    "noise",
    "cleanliness",
    "parking",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "emergency"]),
})
export const complaintAssignmentSchema = z.object({
  assigneeId: z.string().min(1, "Select a committee member"),
  note: z.string().trim().max(300),
})
export const complaintStatusSchema = z.object({
  status: z.enum(["in-progress", "resolved", "closed"]),
  note: z.string().trim().min(3, "Add a status note").max(500),
})
export type ComplaintFormValues = z.infer<typeof complaintFormSchema>
export const complaintFormDefaultValues: ComplaintFormValues = {
  title: "",
  description: "",
  category: "maintenance",
  priority: "medium",
}
