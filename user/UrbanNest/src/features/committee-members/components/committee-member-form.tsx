import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BriefcaseBusiness,
  CalendarDays,
  Image,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import {
  FieldHint,
  FormActions,
  FormSection,
  RequiredLabel,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import {
  committeeDepartments,
  committeeResponsibilities,
} from "@/features/committee-members/data/committee-members.mock"
import {
  committeeMemberFormDefaultValues,
  committeeMemberFormSchema,
  type CommitteeMemberFormValues,
} from "@/features/committee-members/schemas/committee-member.schema"
import { cn } from "@/lib/utils"

export type CommitteeMemberFormMode = "create" | "edit"

export interface CommitteeMemberFormProps {
  mode: CommitteeMemberFormMode
  initialValues?: CommitteeMemberFormValues
  isSubmitting?: boolean
  onSubmit: (values: CommitteeMemberFormValues) => void | Promise<void>
  onCancel: () => void
  className?: string
}

const controlClassName = cn(
  "h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs",
  "outline-none transition-colors placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70",
  "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
)

const today = (() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
})()

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <FieldHint id={id} variant="error">
      {message}
    </FieldHint>
  ) : null
}

export function CommitteeMemberForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className,
}: CommitteeMemberFormProps) {
  const defaultValues = useMemo(
    () => ({ ...committeeMemberFormDefaultValues, ...initialValues }),
    [initialValues],
  )
  const form = useForm<CommitteeMemberFormValues>({
    resolver: zodResolver(committeeMemberFormSchema),
    defaultValues,
    mode: "onBlur",
  })
  const { errors, isDirty } = form.formState
  const selectedResponsibilities =
    useWatch({ control: form.control, name: "responsibilities" }) ?? []
  const shouldWarn = isDirty && !isSubmitting

  useEffect(() => {
    if (!shouldWarn) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", warnBeforeUnload)
    return () => window.removeEventListener("beforeunload", warnBeforeUnload)
  }, [shouldWarn])

  const handleCancel = () => {
    if (
      shouldWarn &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave this form?",
      )
    ) {
      return
    }
    onCancel()
  }

  return (
    <form
      className={cn("min-w-0 space-y-8", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label={
        mode === "create"
          ? "Add committee member form"
          : "Edit committee member form"
      }
    >
      <FormSection
        title="Personal information"
        description="Enter the committee member's identity and contact details."
        icon={<UserRound />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-full-name" required>
            Full name
          </RequiredLabel>
          <div className="relative">
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-full-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Anjali Deshmukh"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "committee-full-name-error" : undefined
              }
              {...form.register("fullName")}
            />
          </div>
          <FieldError
            id="committee-full-name-error"
            message={errors.fullName?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-email" required>
            Email
          </RequiredLabel>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="member@example.com"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "committee-email-error" : undefined
              }
              {...form.register("email")}
            />
          </div>
          <FieldError
            id="committee-email-error"
            message={errors.email?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-mobile" required>
            Mobile number
          </RequiredLabel>
          <div className="relative">
            <Phone
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={
                errors.mobile ? "committee-mobile-error" : undefined
              }
              {...form.register("mobile")}
            />
          </div>
          <FieldError
            id="committee-mobile-error"
            message={errors.mobile?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-profile-image">
            Profile image URL
          </RequiredLabel>
          <div className="relative">
            <Image
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-profile-image"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/profile.jpg"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.profileImageUrl)}
              aria-describedby={
                errors.profileImageUrl
                  ? "committee-profile-image-error"
                  : "committee-profile-image-hint"
              }
              {...form.register("profileImageUrl")}
            />
          </div>
          {!errors.profileImageUrl ? (
            <FieldHint id="committee-profile-image-hint">
              Optional. Image upload can replace this URL when the media API is connected.
            </FieldHint>
          ) : null}
          <FieldError
            id="committee-profile-image-error"
            message={errors.profileImageUrl?.message}
          />
        </div>
      </FormSection>

      <FormSection
        title="Committee assignment"
        description="Set the member's department, designation, and access status."
        icon={<BriefcaseBusiness />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-department" required>
            Department
          </RequiredLabel>
          <select
            id="committee-department"
            className={controlClassName}
            aria-invalid={Boolean(errors.department)}
            aria-describedby={
              errors.department ? "committee-department-error" : undefined
            }
            {...form.register("department")}
          >
            <option value="">Select a department</option>
            {committeeDepartments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <FieldError
            id="committee-department-error"
            message={errors.department?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-designation" required>
            Designation
          </RequiredLabel>
          <div className="relative">
            <BriefcaseBusiness
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-designation"
              type="text"
              placeholder="e.g. Maintenance Coordinator"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.designation)}
              aria-describedby={
                errors.designation ? "committee-designation-error" : undefined
              }
              {...form.register("designation")}
            />
          </div>
          <FieldError
            id="committee-designation-error"
            message={errors.designation?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-joined-date" required>
            Joined date
          </RequiredLabel>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <input
              id="committee-joined-date"
              type="date"
              max={today}
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.joinedDate)}
              aria-describedby={
                errors.joinedDate ? "committee-joined-date-error" : undefined
              }
              {...form.register("joinedDate")}
            />
          </div>
          <FieldError
            id="committee-joined-date-error"
            message={errors.joinedDate?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="committee-status" required>
            Account status
          </RequiredLabel>
          <div className="relative">
            <ShieldCheck
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            />
            <select
              id="committee-status"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={
                errors.status ? "committee-status-error" : undefined
              }
              {...form.register("status")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <FieldError
            id="committee-status-error"
            message={errors.status?.message}
          />
        </div>
      </FormSection>

      <FormSection
        title="Assigned responsibilities"
        description="Choose what this member can coordinate. Select up to eight responsibilities."
        icon={<ShieldCheck />}
        columns={1}
      >
        <fieldset
          className="min-w-0 space-y-3"
          aria-invalid={Boolean(errors.responsibilities)}
          aria-describedby={
            errors.responsibilities
              ? "committee-responsibilities-error"
              : "committee-responsibilities-hint"
          }
        >
          <legend className="sr-only">Committee member responsibilities</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {committeeResponsibilities.map((responsibility) => (
              <label
                key={responsibility}
                className={cn(
                  "flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm transition-colors",
                  "hover:bg-muted/50 has-checked:border-primary/50 has-checked:bg-primary/5",
                  "focus-within:ring-2 focus-within:ring-ring/30",
                )}
              >
                <input
                  type="checkbox"
                  value={responsibility}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                  disabled={
                    selectedResponsibilities.length >= 8 &&
                    !selectedResponsibilities.includes(responsibility)
                  }
                  {...form.register("responsibilities")}
                />
                <span className="min-w-0 leading-5 font-medium">
                  {responsibility}
                </span>
              </label>
            ))}
          </div>
          {!errors.responsibilities ? (
            <FieldHint id="committee-responsibilities-hint">
              {selectedResponsibilities.length} of 8 responsibilities selected.
            </FieldHint>
          ) : null}
          <FieldError
            id="committee-responsibilities-error"
            message={errors.responsibilities?.message}
          />
        </fieldset>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : null}
          {isSubmitting
            ? mode === "create"
              ? "Adding member..."
              : "Saving changes..."
            : mode === "create"
              ? "Add committee member"
              : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}

