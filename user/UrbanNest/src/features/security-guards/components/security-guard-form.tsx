import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarDays,
  Clock3,
  ContactRound,
  IdCard,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useForm } from "react-hook-form"

import { FieldHint } from "@/components/forms/field-hint"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import { gateOptions, shiftOptions } from "@/features/security-guards/data/security-guards.mock"
import {
  securityGuardFormSchema,
  type SecurityGuardFormValues,
} from "@/features/security-guards/schemas/security-guard.schema"
import { cn } from "@/lib/utils"

export interface SecurityGuardFormProps {
  mode: "create" | "edit"
  initialValues: SecurityGuardFormValues
  isSubmitting?: boolean
  onSubmit: (values: SecurityGuardFormValues) => void | Promise<void>
  onCancel: () => void
}

const controlClassName = cn(
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
)

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-xs font-medium text-destructive">{message}</p>
}

export function SecurityGuardForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: SecurityGuardFormProps) {
  const form = useForm<SecurityGuardFormValues>({
    resolver: zodResolver(securityGuardFormSchema),
    defaultValues: initialValues,
  })
  const { errors } = form.formState
  const shiftRegistration = form.register("shiftName")

  return (
    <form className="min-w-0 space-y-8" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection
        title="Personal information"
        description="Add the guard's identity and contact details."
        icon={<UserRound />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-full-name" required>Full name</RequiredLabel>
          <div className="relative">
            <UserRound aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="guard-full-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Arjun Singh"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "guard-full-name-error" : undefined}
              {...form.register("fullName")}
            />
          </div>
          <FieldError id="guard-full-name-error" message={errors.fullName?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-email" required>Email</RequiredLabel>
          <div className="relative">
            <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="guard-email"
              type="email"
              autoComplete="email"
              placeholder="guard@example.com"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "guard-email-error" : undefined}
              {...form.register("email")}
            />
          </div>
          <FieldError id="guard-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-mobile" required>Mobile number</RequiredLabel>
          <div className="relative">
            <Phone aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="guard-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? "guard-mobile-error" : undefined}
              {...form.register("mobile")}
            />
          </div>
          <FieldError id="guard-mobile-error" message={errors.mobile?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-profile-image">Profile image URL</RequiredLabel>
          <input
            id="guard-profile-image"
            type="url"
            inputMode="url"
            placeholder="https://example.com/profile.jpg"
            className={controlClassName}
            aria-invalid={Boolean(errors.profileImageUrl)}
            aria-describedby={errors.profileImageUrl ? "guard-profile-image-error" : "guard-profile-image-hint"}
            {...form.register("profileImageUrl")}
          />
          {!errors.profileImageUrl ? <FieldHint id="guard-profile-image-hint">Optional public image URL for the guard profile.</FieldHint> : null}
          <FieldError id="guard-profile-image-error" message={errors.profileImageUrl?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Employment assignment"
        description="Assign an employee ID, gate, and working shift."
        icon={<ShieldCheck />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-employee-id" required>Employee ID</RequiredLabel>
          <div className="relative">
            <IdCard aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="guard-employee-id"
              type="text"
              autoCapitalize="characters"
              placeholder="e.g. SG-1042"
              className={cn(controlClassName, "pl-10 uppercase")}
              aria-invalid={Boolean(errors.employeeId)}
              aria-describedby={errors.employeeId ? "guard-employee-id-error" : undefined}
              {...form.register("employeeId")}
            />
          </div>
          <FieldError id="guard-employee-id-error" message={errors.employeeId?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-gate" required>Gate</RequiredLabel>
          <div className="relative">
            <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <select
              id="guard-gate"
              className={cn(controlClassName, "appearance-none pl-10")}
              aria-invalid={Boolean(errors.gate)}
              aria-describedby={errors.gate ? "guard-gate-error" : undefined}
              {...form.register("gate")}
            >
              <option value="">Select a gate</option>
              {gateOptions.map((gate) => <option key={gate} value={gate}>{gate}</option>)}
            </select>
          </div>
          <FieldError id="guard-gate-error" message={errors.gate?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-shift" required>Shift</RequiredLabel>
          <select
            id="guard-shift"
            className={controlClassName}
            aria-invalid={Boolean(errors.shiftName)}
            aria-describedby={errors.shiftName ? "guard-shift-error" : "guard-shift-hint"}
            {...shiftRegistration}
            onChange={(event) => {
              shiftRegistration.onChange(event)
              const shift = shiftOptions.find((option) => option.name === event.target.value)
              if (shift) {
                form.setValue("shiftStartTime", shift.startTime, { shouldDirty: true, shouldValidate: true })
                form.setValue("shiftEndTime", shift.endTime, { shouldDirty: true, shouldValidate: true })
              }
            }}
          >
            <option value="">Select a shift</option>
            {shiftOptions.map((shift) => (
              <option key={shift.name} value={shift.name}>
                {shift.name} ({shift.startTime}–{shift.endTime})
              </option>
            ))}
          </select>
          {!errors.shiftName ? <FieldHint id="guard-shift-hint">Selecting a shift fills its standard start and end time.</FieldHint> : null}
          <FieldError id="guard-shift-error" message={errors.shiftName?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="guard-shift-start" required>Start time</RequiredLabel>
            <div className="relative">
              <Clock3 aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <input
                id="guard-shift-start"
                type="time"
                className={cn(controlClassName, "pl-10")}
                aria-invalid={Boolean(errors.shiftStartTime)}
                aria-describedby={errors.shiftStartTime ? "guard-shift-start-error" : undefined}
                {...form.register("shiftStartTime")}
              />
            </div>
            <FieldError id="guard-shift-start-error" message={errors.shiftStartTime?.message} />
          </div>
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="guard-shift-end" required>End time</RequiredLabel>
            <input
              id="guard-shift-end"
              type="time"
              className={controlClassName}
              aria-invalid={Boolean(errors.shiftEndTime)}
              aria-describedby={errors.shiftEndTime ? "guard-shift-end-error" : undefined}
              {...form.register("shiftEndTime")}
            />
            <FieldError id="guard-shift-end-error" message={errors.shiftEndTime?.message} />
          </div>
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-joining-date" required>Joining date</RequiredLabel>
          <div className="relative">
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="guard-joining-date"
              type="date"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.joiningDate)}
              aria-describedby={errors.joiningDate ? "guard-joining-date-error" : undefined}
              {...form.register("joiningDate")}
            />
          </div>
          <FieldError id="guard-joining-date-error" message={errors.joiningDate?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-status" required>Status</RequiredLabel>
          <select
            id="guard-status"
            className={controlClassName}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "guard-status-error" : undefined}
            {...form.register("status")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <FieldError id="guard-status-error" message={errors.status?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Emergency contact"
        description="Provide a trusted contact for urgent situations."
        icon={<ContactRound />}
        columns={3}
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-emergency-name" required>Contact name</RequiredLabel>
          <input
            id="guard-emergency-name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactName)}
            aria-describedby={errors.emergencyContactName ? "guard-emergency-name-error" : undefined}
            {...form.register("emergencyContactName")}
          />
          <FieldError id="guard-emergency-name-error" message={errors.emergencyContactName?.message} />
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-emergency-number" required>Contact number</RequiredLabel>
          <input
            id="guard-emergency-number"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactNumber)}
            aria-describedby={errors.emergencyContactNumber ? "guard-emergency-number-error" : undefined}
            {...form.register("emergencyContactNumber")}
          />
          <FieldError id="guard-emergency-number-error" message={errors.emergencyContactNumber?.message} />
        </div>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="guard-emergency-relationship" required>Relationship</RequiredLabel>
          <input
            id="guard-emergency-relationship"
            type="text"
            placeholder="e.g. Spouse"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactRelationship)}
            aria-describedby={errors.emergencyContactRelationship ? "guard-emergency-relationship-error" : undefined}
            {...form.register("emergencyContactRelationship")}
          />
          <FieldError id="guard-emergency-relationship-error" message={errors.emergencyContactRelationship?.message} />
        </div>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
          {isSubmitting
            ? mode === "create" ? "Adding guard..." : "Saving changes..."
            : mode === "create" ? "Add security guard" : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}
