export interface UrbanNestSettings {
  societyName: string
  address: string
  supportEmail: string
  timezone: string
  currency: "INR" | "USD"
  financialYearStart: string
  maintenanceDueDay: number
  lateFeePercentage: number
  passwordExpiryDays: number
  twoFactorRequired: boolean
  notificationEmail: boolean
  notificationPush: boolean
  notificationSms: boolean
  visitorAlerts: boolean
  complaintUpdates: boolean
  paymentReminders: boolean
}

export type UpdateSettingsRequest = UrbanNestSettings
