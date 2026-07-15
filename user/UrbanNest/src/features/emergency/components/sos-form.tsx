import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Siren } from "lucide-react"
import { useForm } from "react-hook-form"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  emergencyDefaultValues,
  emergencySchema,
  type EmergencyFormValues,
} from "@/features/emergency/schemas/emergency.schema"
import { cn } from "@/utils/cn"
const control =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
export function SosForm({
  submitting = false,
  onSubmit,
}: {
  submitting?: boolean
  onSubmit: (values: EmergencyFormValues) => void | Promise<void>
}) {
  const form = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencySchema),
    defaultValues: emergencyDefaultValues,
  })
  const errors = form.formState.errors
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <label className="block space-y-1.5">
        <RequiredLabel required>Emergency type</RequiredLabel>
        <select className={control} {...form.register("type")}>
          <option value="medical">Medical</option>
          <option value="fire">Fire</option>
          <option value="security">Security</option>
          <option value="accident">Accident</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block space-y-1.5">
        <RequiredLabel required>Contact mobile</RequiredLabel>
        <input
          className={control}
          inputMode="tel"
          placeholder="10-digit mobile number"
          {...form.register("mobile")}
        />
        {errors.mobile && (
          <p role="alert" className="text-xs text-destructive">
            {errors.mobile.message}
          </p>
        )}
      </label>
      <label className="block space-y-1.5">
        <RequiredLabel required>What is happening?</RequiredLabel>
        <textarea
          rows={5}
          className={cn(control, "h-auto py-3")}
          placeholder="Share immediate details and exact location."
          {...form.register("message")}
        />
        {errors.message && (
          <p role="alert" className="text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </label>
      <Button
        type="submit"
        variant="destructive"
        size="lg"
        disabled={submitting}
        className="h-14 w-full rounded-xl text-base shadow-lg shadow-destructive/20"
      >
        {submitting ? <LoaderCircle className="animate-spin" /> : <Siren />}Send
        SOS alert
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        For life-threatening emergencies, also contact your local emergency
        services immediately.
      </p>
    </form>
  )
}
