import { z } from "zod"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

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

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || isValidDate(value), "Enter a valid date")
  .refine((value) => !value || value <= getToday(), "Date of birth cannot be in the future")

export const residentFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must contain at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
  dateOfBirth: optionalDate,
  profileImageUrl: z
    .string()
    .trim()
    .refine(isValidUrl, "Enter a valid profile image URL"),
  towerId: z.string().trim().min(1, "Tower is required"),
  flatNumber: z.string().trim().min(1, "Flat number is required"),
  floor: z
    .number({ error: "Floor must be numeric" })
    .int("Floor must be a whole number")
    .min(0, "Floor cannot be negative"),
  ownershipType: z.enum(["owner", "tenant", "family_member"], {
    error: "Ownership type is required",
  }),
  moveInDate: z
    .string()
    .trim()
    .min(1, "Move-in date is required")
    .refine(isValidDate, "Enter a valid move-in date")
    .refine((value) => !isValidDate(value) || value <= getToday(), "Move-in date cannot be in the future"),
  emergencyContactName: z.string().trim(),
  emergencyContactNumber: z
    .string()
    .trim()
    .refine(
      (value) => !value || INDIAN_MOBILE_PATTERN.test(value),
      "Enter a valid 10-digit Indian mobile number",
    ),
  emergencyContactRelationship: z.string().trim(),
  familyMemberCount: z
    .number({ error: "Family member count must be numeric" })
    .int("Family member count must be a whole number")
    .min(0, "Family member count cannot be negative"),
  vehicleCount: z
    .number({ error: "Vehicle count must be numeric" })
    .int("Vehicle count must be a whole number")
    .min(0, "Vehicle count cannot be negative"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters"),
})

export type ResidentFormValues = z.infer<typeof residentFormSchema>

export const residentFormDefaultValues: ResidentFormValues = {
  fullName: "",
  email: "",
  mobile: "",
  dateOfBirth: "",
  profileImageUrl: "",
  towerId: "",
  flatNumber: "",
  floor: 0,
  ownershipType: "tenant",
  moveInDate: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  emergencyContactRelationship: "",
  familyMemberCount: 0,
  vehicleCount: 0,
  notes: "",
}
