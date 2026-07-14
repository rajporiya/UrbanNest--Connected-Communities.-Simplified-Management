import { z } from "zod"

export const settingsSchema = z.object({
  societyName: z.string().trim().min(2, "Society name is required").max(100),
  address: z.string().trim().min(5, "Address is required").max(300),
  supportEmail: z.string().trim().email("Enter a valid support email"),
  timezone: z.string().min(1),
  currency: z.enum(["INR", "USD"]),
  financialYearStart: z.string().min(1),
  maintenanceDueDay: z.number().int().min(1).max(28),
  lateFeePercentage: z.number().min(0).max(25),
  passwordExpiryDays: z.number().int().min(0).max(365),
  twoFactorRequired: z.boolean(),
  notificationEmail: z.boolean(),
  notificationPush: z.boolean(),
  notificationSms: z.boolean(),
  visitorAlerts: z.boolean(),
  complaintUpdates: z.boolean(),
  paymentReminders: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
