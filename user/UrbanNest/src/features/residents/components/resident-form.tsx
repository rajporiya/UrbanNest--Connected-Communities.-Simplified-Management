import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarDays,
  CarFront,
  ContactRound,
  Home,
  Image,
  LoaderCircle,
  Mail,
  MapPinHouse,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import {
  CharacterCounter,
  FieldHint,
  FormActions,
  FormSection,
  RequiredLabel,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { flatOptions, towerOptions } from "@/features/residents/data/residents.mock"
import {
  residentFormDefaultValues,
  residentFormSchema,
  type ResidentFormValues,
} from "@/features/residents/schemas/resident.schema"
import { cn } from "@/lib/utils"

export type ResidentFormMode = "create" | "edit"

export interface ResidentFormProps {
  mode: ResidentFormMode
  initialValues?: ResidentFormValues
  isSubmitting?: boolean
  onSubmit: (values: ResidentFormValues) => void | Promise<void>
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

const textAreaClassName = cn(
  controlClassName,
  "min-h-28 resize-y py-3 leading-6",
)

const today = (() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
})()

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <FieldHint id={id} variant="error">{message}</FieldHint> : null
}

export function ResidentForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className,
}: ResidentFormProps) {
  const defaultValues = useMemo(
    () => ({ ...residentFormDefaultValues, ...initialValues }),
    [initialValues],
  )
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues,
    mode: "onBlur",
  })
  const { errors, isDirty } = form.formState
  const selectedTowerId = useWatch({ control: form.control, name: "towerId" })
  const notes = useWatch({ control: form.control, name: "notes" })
  const availableFlats = useMemo(
    () => flatOptions.filter((flat) => flat.towerId === selectedTowerId),
    [selectedTowerId],
  )
  const shouldWarn = isDirty && !isSubmitting

  useEffect(() => {
    if (!shouldWarn) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    const warnBeforeLinkNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      const link = target instanceof Element ? target.closest("a[href]") : null
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return

      const destination = new URL(link.href, window.location.href)
      if (destination.href === window.location.href) return
      if (window.confirm("You have unsaved changes. Are you sure you want to leave this form?")) return

      event.preventDefault()
      event.stopPropagation()
    }

    window.addEventListener("beforeunload", warnBeforeUnload)
    document.addEventListener("click", warnBeforeLinkNavigation, true)
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload)
      document.removeEventListener("click", warnBeforeLinkNavigation, true)
    }
  }, [shouldWarn])

  const handleCancel = () => {
    if (
      shouldWarn &&
      !window.confirm("You have unsaved changes. Are you sure you want to leave this form?")
    ) {
      return
    }
    onCancel()
  }

  const towerRegistration = form.register("towerId")
  const flatRegistration = form.register("flatNumber")

  return (
    <form
      className={cn("min-w-0 space-y-8", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label={mode === "create" ? "Add resident form" : "Edit resident form"}
    >
      <FormSection
        title="Personal information"
        description="Enter the resident's identity and contact details."
        icon={<UserRound />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-full-name" required>Full name</RequiredLabel>
          <div className="relative">
            <UserRound aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-full-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Raj Mehta"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "resident-full-name-error" : undefined}
              {...form.register("fullName")}
            />
          </div>
          <FieldError id="resident-full-name-error" message={errors.fullName?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-email" required>Email</RequiredLabel>
          <div className="relative">
            <Mail aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="resident@example.com"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "resident-email-error" : undefined}
              {...form.register("email")}
            />
          </div>
          <FieldError id="resident-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-mobile" required>Mobile number</RequiredLabel>
          <div className="relative">
            <Phone aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? "resident-mobile-error" : undefined}
              {...form.register("mobile")}
            />
          </div>
          <FieldError id="resident-mobile-error" message={errors.mobile?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-date-of-birth">Date of birth</RequiredLabel>
          <div className="relative">
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-date-of-birth"
              type="date"
              max={today}
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.dateOfBirth)}
              aria-describedby={errors.dateOfBirth ? "resident-date-of-birth-error" : undefined}
              {...form.register("dateOfBirth")}
            />
          </div>
          <FieldError id="resident-date-of-birth-error" message={errors.dateOfBirth?.message} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <RequiredLabel htmlFor="resident-profile-image">Profile image URL</RequiredLabel>
          <div className="relative">
            <Image aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-profile-image"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/profile-image.jpg"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.profileImageUrl)}
              aria-describedby={errors.profileImageUrl ? "resident-profile-image-error" : "resident-profile-image-hint"}
              {...form.register("profileImageUrl")}
            />
          </div>
          <FieldHint id="resident-profile-image-hint">Image upload will replace this URL field when the media API is connected.</FieldHint>
          <FieldError id="resident-profile-image-error" message={errors.profileImageUrl?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Residence information"
        description="Assign the resident to an UrbanNest home."
        icon={<Home />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-tower" required>Tower</RequiredLabel>
          <div className="relative">
            <MapPinHouse aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <select
              id="resident-tower"
              className={cn(controlClassName, "appearance-none pl-10")}
              aria-invalid={Boolean(errors.towerId)}
              aria-describedby={errors.towerId ? "resident-tower-error" : undefined}
              {...towerRegistration}
              onChange={(event) => {
                towerRegistration.onChange(event)
                const selectedFlat = flatOptions.find(
                  (flat) => flat.towerId === event.target.value && flat.number === form.getValues("flatNumber"),
                )
                if (!selectedFlat) {
                  form.setValue("flatNumber", "", { shouldDirty: true, shouldValidate: true })
                  form.setValue("floor", 0, { shouldDirty: true, shouldValidate: true })
                }
              }}
            >
              <option value="">Select a tower</option>
              {towerOptions.map((tower) => <option key={tower.id} value={tower.id}>{tower.name}</option>)}
            </select>
          </div>
          <FieldError id="resident-tower-error" message={errors.towerId?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-flat" required>Flat number</RequiredLabel>
          <select
            id="resident-flat"
            className={controlClassName}
            disabled={!selectedTowerId}
            aria-invalid={Boolean(errors.flatNumber)}
            aria-describedby={errors.flatNumber ? "resident-flat-error" : "resident-flat-hint"}
            {...flatRegistration}
            onChange={(event) => {
              flatRegistration.onChange(event)
              const selectedFlat = availableFlats.find((flat) => flat.number === event.target.value)
              form.setValue("floor", selectedFlat?.floor ?? 0, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <option value="">{selectedTowerId ? "Select a flat" : "Select a tower first"}</option>
            {availableFlats.map((flat) => (
              <option key={flat.id} value={flat.number}>{flat.number} · Floor {flat.floor}</option>
            ))}
          </select>
          {!errors.flatNumber ? <FieldHint id="resident-flat-hint">Available mock flats are filtered by tower.</FieldHint> : null}
          <FieldError id="resident-flat-error" message={errors.flatNumber?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-floor" required>Floor</RequiredLabel>
          <input
            id="resident-floor"
            type="number"
            min={0}
            inputMode="numeric"
            className={controlClassName}
            aria-invalid={Boolean(errors.floor)}
            aria-describedby={errors.floor ? "resident-floor-error" : "resident-floor-hint"}
            {...form.register("floor", { valueAsNumber: true })}
          />
          {!errors.floor ? <FieldHint id="resident-floor-hint">Automatically set from the selected flat.</FieldHint> : null}
          <FieldError id="resident-floor-error" message={errors.floor?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-ownership" required>Ownership type</RequiredLabel>
          <select
            id="resident-ownership"
            className={controlClassName}
            aria-invalid={Boolean(errors.ownershipType)}
            aria-describedby={errors.ownershipType ? "resident-ownership-error" : undefined}
            {...form.register("ownershipType")}
          >
            <option value="owner">Owner</option>
            <option value="tenant">Tenant</option>
            <option value="family_member">Family member</option>
          </select>
          <FieldError id="resident-ownership-error" message={errors.ownershipType?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-move-in-date" required>Move-in date</RequiredLabel>
          <input
            id="resident-move-in-date"
            type="date"
            max={today}
            className={controlClassName}
            aria-invalid={Boolean(errors.moveInDate)}
            aria-describedby={errors.moveInDate ? "resident-move-in-date-error" : undefined}
            {...form.register("moveInDate")}
          />
          <FieldError id="resident-move-in-date-error" message={errors.moveInDate?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Emergency information"
        description="Add someone the committee can contact during an emergency."
        icon={<ContactRound />}
        columns={3}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="emergency-contact-name">Contact name</RequiredLabel>
          <input
            id="emergency-contact-name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactName)}
            aria-describedby={errors.emergencyContactName ? "emergency-contact-name-error" : undefined}
            {...form.register("emergencyContactName")}
          />
          <FieldError id="emergency-contact-name-error" message={errors.emergencyContactName?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="emergency-contact-number">Contact number</RequiredLabel>
          <input
            id="emergency-contact-number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="10-digit mobile number"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactNumber)}
            aria-describedby={errors.emergencyContactNumber ? "emergency-contact-number-error" : undefined}
            {...form.register("emergencyContactNumber")}
          />
          <FieldError id="emergency-contact-number-error" message={errors.emergencyContactNumber?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="emergency-contact-relationship">Relationship</RequiredLabel>
          <input
            id="emergency-contact-relationship"
            type="text"
            placeholder="e.g. Spouse"
            className={controlClassName}
            aria-invalid={Boolean(errors.emergencyContactRelationship)}
            aria-describedby={errors.emergencyContactRelationship ? "emergency-contact-relationship-error" : undefined}
            {...form.register("emergencyContactRelationship")}
          />
          <FieldError id="emergency-contact-relationship-error" message={errors.emergencyContactRelationship?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Additional information"
        description="Record household details and useful committee notes."
        icon={<UsersRound />}
        columns={2}
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-family-count" required>Number of family members</RequiredLabel>
          <div className="relative">
            <UsersRound aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-family-count"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.familyMemberCount)}
              aria-describedby={errors.familyMemberCount ? "resident-family-count-error" : undefined}
              {...form.register("familyMemberCount", { valueAsNumber: true })}
            />
          </div>
          <FieldError id="resident-family-count-error" message={errors.familyMemberCount?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="resident-vehicle-count" required>Vehicle count</RequiredLabel>
          <div className="relative">
            <CarFront aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
            <input
              id="resident-vehicle-count"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.vehicleCount)}
              aria-describedby={errors.vehicleCount ? "resident-vehicle-count-error" : undefined}
              {...form.register("vehicleCount", { valueAsNumber: true })}
            />
          </div>
          <FieldError id="resident-vehicle-count-error" message={errors.vehicleCount?.message} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <RequiredLabel htmlFor="resident-notes">Notes</RequiredLabel>
          <textarea
            id="resident-notes"
            rows={4}
            maxLength={500}
            placeholder="Add access notes, preferences, or other information relevant to the committee."
            className={textAreaClassName}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? "resident-notes-error" : "resident-notes-count"}
            {...form.register("notes")}
          />
          <div id="resident-notes-count">
            <CharacterCounter current={notes.length} max={500} />
          </div>
          <FieldError id="resident-notes-error" message={errors.notes?.message} />
        </div>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
          {isSubmitting
            ? mode === "create" ? "Adding resident..." : "Saving changes..."
            : mode === "create" ? "Add resident" : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}
