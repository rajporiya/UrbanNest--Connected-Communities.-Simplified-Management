import type { UrbanNestSettings } from "@/features/settings/types/settings.types"

export const settingsMock: UrbanNestSettings = {
  societyName: "UrbanNest Residency",
  address: "Thaltej, Ahmedabad, Gujarat 380054",
  supportEmail: "support@urbannest.example",
  timezone: "Asia/Kolkata",
  currency: "INR",
  financialYearStart: "April",
  maintenanceDueDay: 10,
  lateFeePercentage: 2,
  passwordExpiryDays: 90,
  twoFactorRequired: false,
  notificationEmail: true,
  notificationPush: true,
  notificationSms: false,
  visitorAlerts: true,
  complaintUpdates: true,
  paymentReminders: true,
}
