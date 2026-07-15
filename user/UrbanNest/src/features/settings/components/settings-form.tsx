import { zodResolver } from "@hookform/resolvers/zod"
import {
  BellRing,
  Building2,
  LoaderCircle,
  ReceiptIndianRupee,
  Save,
  ShieldCheck,
} from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import { SettingToggle } from "@/features/settings/components/setting-toggle"
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/features/settings/schemas/settings.schema"
import { cn } from "@/lib/utils"

interface SettingsFormProps {
  values: SettingsFormValues
  saving: boolean
  canManageSociety: boolean
  onSubmit: (values: SettingsFormValues) => void | Promise<void>
}
const control = cn(
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none",
  "focus-visible:ring-2 focus-visible:ring-ring/40 disabled:bg-muted disabled:opacity-70"
)
function ErrorText({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  ) : null
}

export function SettingsForm({
  values,
  saving,
  canManageSociety,
  onSubmit,
}: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: values,
  })
  useEffect(() => form.reset(values), [form, values])
  return (
    <form
      className="space-y-8"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection
        title="General settings"
        description="Core identity and locale settings for your society."
        icon={<Building2 />}
        columns={2}
        divider
      >
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="society-name" required>
            Society name
          </RequiredLabel>
          <input
            id="society-name"
            className={control}
            disabled={!canManageSociety}
            {...form.register("societyName")}
          />
          <ErrorText message={form.formState.errors.societyName?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="support-email" required>
            Support email
          </RequiredLabel>
          <input
            id="support-email"
            type="email"
            className={control}
            disabled={!canManageSociety}
            {...form.register("supportEmail")}
          />
          <ErrorText message={form.formState.errors.supportEmail?.message} />
        </label>
        <label className="space-y-1.5 md:col-span-2">
          <RequiredLabel htmlFor="society-address" required>
            Address
          </RequiredLabel>
          <textarea
            id="society-address"
            rows={3}
            className={cn(control, "h-auto py-3")}
            disabled={!canManageSociety}
            {...form.register("address")}
          />
          <ErrorText message={form.formState.errors.address?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="timezone">Timezone</RequiredLabel>
          <select
            id="timezone"
            className={control}
            disabled={!canManageSociety}
            {...form.register("timezone")}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="currency">Currency</RequiredLabel>
          <select
            id="currency"
            className={control}
            disabled={!canManageSociety}
            {...form.register("currency")}
          >
            <option value="INR">Indian Rupee (INR)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </label>
      </FormSection>
      <FormSection
        title="Maintenance settings"
        description="Configure billing cycles and overdue charges."
        icon={<ReceiptIndianRupee />}
        columns={3}
        divider
      >
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="fy-start">Financial year</RequiredLabel>
          <select
            id="fy-start"
            className={control}
            disabled={!canManageSociety}
            {...form.register("financialYearStart")}
          >
            <option>April</option>
            <option>January</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="due-day">Due day</RequiredLabel>
          <input
            id="due-day"
            type="number"
            min={1}
            max={28}
            className={control}
            disabled={!canManageSociety}
            {...form.register("maintenanceDueDay", { valueAsNumber: true })}
          />
          <ErrorText
            message={form.formState.errors.maintenanceDueDay?.message}
          />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="late-fee">Late fee (%)</RequiredLabel>
          <input
            id="late-fee"
            type="number"
            min={0}
            max={25}
            step="0.5"
            className={control}
            disabled={!canManageSociety}
            {...form.register("lateFeePercentage", { valueAsNumber: true })}
          />
        </label>
      </FormSection>
      <FormSection
        title="Security"
        description="Set organization-wide account security rules."
        icon={<ShieldCheck />}
        columns={2}
        divider
      >
        <label className="space-y-1.5">
          <RequiredLabel htmlFor="expiry-days">
            Password expiry (days)
          </RequiredLabel>
          <input
            id="expiry-days"
            type="number"
            min={0}
            max={365}
            className={control}
            disabled={!canManageSociety}
            {...form.register("passwordExpiryDays", { valueAsNumber: true })}
          />
        </label>
        <Controller
          name="twoFactorRequired"
          control={form.control}
          render={({ field }) => (
            <SettingToggle
              id="two-factor-required"
              label="Require two-factor authentication"
              description="Require committee and guard accounts to configure a second factor."
              checked={field.value}
              disabled={!canManageSociety}
              onChange={field.onChange}
            />
          )}
        />
      </FormSection>
      <FormSection
        title="Notification preferences"
        description="Choose how and when UrbanNest keeps you informed."
        icon={<BellRing />}
        columns={2}
      >
        {(
          [
            [
              "notificationEmail",
              "Email notifications",
              "Receive important updates by email.",
            ],
            [
              "notificationPush",
              "Push notifications",
              "Show real-time browser and mobile alerts.",
            ],
            [
              "notificationSms",
              "SMS notifications",
              "Receive critical updates by text message.",
            ],
            [
              "visitorAlerts",
              "Visitor alerts",
              "Notify when a visitor arrives at the gate.",
            ],
            [
              "complaintUpdates",
              "Complaint updates",
              "Notify when complaint status or assignee changes.",
            ],
            [
              "paymentReminders",
              "Payment reminders",
              "Notify before maintenance bills become due.",
            ],
          ] as const
        ).map(([name, label, description]) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field }) => (
              <SettingToggle
                id={name}
                label={label}
                description={description}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ))}
      </FormSection>
      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  )
}
