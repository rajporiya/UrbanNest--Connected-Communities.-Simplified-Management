import { z } from "zod"

const phone = z.string().trim().min(8, "Enter a valid mobile number").max(20)
export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required").max(50),
  lastName: z.string().trim().min(2, "Last name is required").max(50),
  phone,
  avatar: z.string().nullable(),
  bio: z.string().trim().max(280),
  address: z.string().trim().max(300),
  emergencyContact: phone,
})
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  })
export type ProfileFormValues = z.infer<typeof profileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
