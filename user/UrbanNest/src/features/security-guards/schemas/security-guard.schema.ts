import { z } from "zod"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/
const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_-]{2,19}$/

const isValidDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const isValidUrl = (value: string) => {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const securityGuardFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .max(254, "Email cannot exceed 254 characters"),
    mobile: z
      .string()
      .trim()
      .regex(INDIAN_MOBILE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
    employeeId: z
      .string()
      .trim()
      .min(1, "Employee ID is required")
      .regex(
        EMPLOYEE_ID_PATTERN,
        "Use 3-20 letters, numbers, hyphens, underscores, or slashes",
      ),
    profileImageUrl: z
      .string()
      .trim()
      .refine(isValidUrl, "Enter a valid profile image URL"),
    gate: z.enum(
      ["Main Gate", "Gate A", "Gate B", "Gate C", "Parking Gate", "Service Gate"],
      { error: "Gate is required" },
    ),
    shiftName: z.enum(["Morning", "Afternoon", "Evening", "Night"], {
      error: "Shift is required",
    }),
    shiftStartTime: z
      .string()
      .trim()
      .regex(TIME_PATTERN, "Enter a valid start time"),
    shiftEndTime: z
      .string()
      .trim()
      .regex(TIME_PATTERN, "Enter a valid end time"),
    joiningDate: z
      .string()
      .trim()
      .min(1, "Joining date is required")
      .refine(isValidDate, "Enter a valid joining date")
      .refine(
        (value) => !isValidDate(value) || value <= getToday(),
        "Joining date cannot be in the future",
      ),
    emergencyContactName: z
      .string()
      .trim()
      .min(2, "Emergency contact name must contain at least 2 characters")
      .max(100, "Emergency contact name cannot exceed 100 characters"),
    emergencyContactNumber: z
      .string()
      .trim()
      .regex(
        INDIAN_MOBILE_PATTERN,
        "Enter a valid 10-digit Indian mobile number",
      ),
    emergencyContactRelationship: z
      .string()
      .trim()
      .min(2, "Relationship must contain at least 2 characters")
      .max(50, "Relationship cannot exceed 50 characters"),
    status: z.enum(["active", "inactive"], { error: "Status is required" }),
  })
  .superRefine((values, context) => {
    if (values.shiftStartTime === values.shiftEndTime) {
      context.addIssue({
        code: "custom",
        path: ["shiftEndTime"],
        message: "Shift end time must be different from its start time",
      })
    }

    if (values.mobile === values.emergencyContactNumber) {
      context.addIssue({
        code: "custom",
        path: ["emergencyContactNumber"],
        message: "Emergency contact number must be different from the guard's mobile",
      })
    }
  })

export type SecurityGuardFormValues = z.infer<typeof securityGuardFormSchema>

export const securityGuardFormDefaultValues: SecurityGuardFormValues = {
  fullName: "",
  email: "",
  mobile: "",
  employeeId: "",
  profileImageUrl: "",
  gate: "Main Gate",
  shiftName: "Morning",
  shiftStartTime: "06:00",
  shiftEndTime: "14:00",
  joiningDate: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  emergencyContactRelationship: "",
  status: "active",
}
