import { z } from "zod"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isValidOptionalUrl(value: string) {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const committeeMemberFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
  profileImageUrl: z
    .string()
    .trim()
    .refine(isValidOptionalUrl, "Enter a valid profile image URL"),
  department: z.string().trim().min(1, "Department is required"),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must contain at least 2 characters")
    .max(80, "Designation cannot exceed 80 characters"),
  responsibilities: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one responsibility")
    .max(8, "Select no more than 8 responsibilities"),
  joinedDate: z
    .string()
    .trim()
    .min(1, "Joining date is required")
    .refine(isValidDate, "Enter a valid joining date")
    .refine(
      (value) => !isValidDate(value) || value <= getToday(),
      "Joining date cannot be in the future",
    ),
  status: z.enum(["active", "inactive"], {
    error: "Status is required",
  }),
})

export type CommitteeMemberFormValues = z.infer<
  typeof committeeMemberFormSchema
>

export const committeeMemberFormDefaultValues: CommitteeMemberFormValues = {
  fullName: "",
  email: "",
  mobile: "",
  profileImageUrl: "",
  department: "",
  designation: "",
  responsibilities: [],
  joinedDate: "",
  status: "active",
}

