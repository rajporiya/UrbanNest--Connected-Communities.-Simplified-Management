import { z } from "zod"

const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address")
const password = z.string().min(1, "Password is required").min(8, "Password must contain at least 8 characters")

export const loginSchema = z.object({ email, password, rememberMe: z.boolean() })
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must contain at least 2 characters"),
  email,
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password,
  confirmPassword: z.string().min(1, "Confirm your password"),
  tower: z.string().min(1, "Select a tower"),
  flatNumber: z.string().trim().min(1, "Flat number is required"),
  termsAccepted: z.boolean().refine(Boolean, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
export const forgotPasswordSchema = z.object({ email })
export const resetPasswordSchema = z.object({ password, confirmPassword: z.string().min(1, "Confirm your new password") })
  .refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
