import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, Clock3, LoaderCircle, UserRound, Home } from "lucide-react"
import { useForm } from "react-hook-form"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  visitorPassSchema,
  type VisitorPassFormValues,
} from "@/features/visitors/schemas/visitor.schema"
import { cn } from "@/utils/cn"

const control =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
function ErrorText({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  ) : null
}
export interface VisitorPassFormProps {
  initialValues: VisitorPassFormValues
  submitting?: boolean
  isGuard?: boolean
  onSubmit: (values: VisitorPassFormValues) => void | Promise<void>
  onCancel: () => void
}

export function VisitorPassForm({
  initialValues,
  submitting = false,
  isGuard = false,
  onSubmit,
  onCancel,
}: VisitorPassFormProps) {
  const form = useForm<VisitorPassFormValues>({
    resolver: zodResolver(visitorPassSchema),
    defaultValues: initialValues,
  })
  const errors = form.formState.errors
  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isGuard && (
        <FormSection
          title="Resident & flat details"
          description="Enter details of the resident being visited."
          icon={<Home />}
          columns={3}
          divider
        >
          <label className="space-y-1.5">
            <RequiredLabel required>Resident name</RequiredLabel>
            <input
              className={control}
              placeholder="e.g. Rajesh Sharma"
              {...form.register("residentName")}
            />
            <ErrorText message={errors.residentName?.message} />
          </label>
          <label className="space-y-1.5">
            <RequiredLabel required>Tower</RequiredLabel>
            <input
              className={control}
              placeholder="e.g. Tower A"
              {...form.register("tower")}
            />
            <ErrorText message={errors.tower?.message} />
          </label>
          <label className="space-y-1.5">
            <RequiredLabel required>Flat number</RequiredLabel>
            <input
              className={control}
              placeholder="e.g. A-101"
              {...form.register("flatNumber")}
            />
            <ErrorText message={errors.flatNumber?.message} />
          </label>
        </FormSection>
      )}

      <FormSection
        title="Visitor information"
        description="Enter the visitor's identity and reason for entry."
        icon={<UserRound />}
        columns={2}
        divider
      >
        <label className="space-y-1.5">
          <RequiredLabel required>Full name</RequiredLabel>
          <input
            className={control}
            autoComplete="name"
            {...form.register("visitorName")}
          />
          <ErrorText message={errors.visitorName?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Mobile number</RequiredLabel>
          <input
            className={control}
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit number"
            {...form.register("mobile")}
          />
          <ErrorText message={errors.mobile?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Purpose</RequiredLabel>
          <select className={control} {...form.register("purpose")}>
            <option value="guest">Guest</option>
            <option value="delivery">Delivery</option>
            <option value="service">Service</option>
            <option value="cab">Cab</option>
            <option value="other">Other</option>
          </select>
          <ErrorText message={errors.purpose?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel>Vehicle number</RequiredLabel>
          <input
            className={control}
            autoCapitalize="characters"
            placeholder="Optional"
            {...form.register("vehicleNumber")}
          />
        </label>
        <label className="space-y-1.5 sm:col-span-2">
          <RequiredLabel required>Purpose details</RequiredLabel>
          <textarea
            rows={3}
            className={cn(control, "h-auto py-3")}
            {...form.register("purposeNote")}
          />
          <ErrorText message={errors.purposeNote?.message} />
        </label>
      </FormSection>
      <FormSection
        title="Visit schedule"
        description="Choose a valid entry window for this pass."
        icon={<CalendarDays />}
        columns={3}
      >
        <label className="space-y-1.5">
          <RequiredLabel required>Visit date</RequiredLabel>
          <input
            type="date"
            className={control}
            {...form.register("visitDate")}
          />
          <ErrorText message={errors.visitDate?.message} />
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Valid from</RequiredLabel>
          <div className="relative">
            <Clock3 className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              type="time"
              className={cn(control, "pl-10")}
              {...form.register("validFrom")}
            />
          </div>
        </label>
        <label className="space-y-1.5">
          <RequiredLabel required>Valid until</RequiredLabel>
          <input
            type="time"
            className={control}
            {...form.register("validUntil")}
          />
          <ErrorText message={errors.validUntil?.message} />
        </label>
      </FormSection>
      <FormActions>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <LoaderCircle className="animate-spin" />}Create
          visitor pass
        </Button>
      </FormActions>
    </form>
  )
}
