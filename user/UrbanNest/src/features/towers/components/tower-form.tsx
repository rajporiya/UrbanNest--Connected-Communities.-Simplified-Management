import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  FileText,
  House,
  Layers3,
  LoaderCircle,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { CharacterCounter } from "@/components/forms/character-counter"
import { FieldHint } from "@/components/forms/field-hint"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  towerFormSchema,
  type TowerFormValues,
} from "@/features/towers/schemas/tower.schema"
import { cn } from "@/lib/utils"

export interface TowerFormProps {
  mode: "create" | "edit"
  initialValues: TowerFormValues
  isSubmitting?: boolean
  onSubmit: (values: TowerFormValues) => void | Promise<void>
  onCancel: () => void
}

const controlClassName = cn(
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
)

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  )
}

export function TowerForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TowerFormProps) {
  const form = useForm<TowerFormValues>({
    resolver: zodResolver(towerFormSchema),
    defaultValues: initialValues,
  })
  const { errors } = form.formState
  const description = useWatch({
    control: form.control,
    name: "description",
  })

  return (
    <form
      className="min-w-0 space-y-8"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSection
        title="Tower information"
        description="Set the tower's identity, capacity, and availability."
        icon={<Building2 />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="tower-name" required>
            Tower name
          </RequiredLabel>
          <div className="relative">
            <Building2
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <input
              id="tower-name"
              type="text"
              autoComplete="off"
              placeholder="e.g. Tower A"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "tower-name-error" : "tower-name-hint"}
              {...form.register("name")}
            />
          </div>
          {!errors.name ? (
            <FieldHint id="tower-name-hint">
              Use a unique, resident-friendly name.
            </FieldHint>
          ) : null}
          <FieldError id="tower-name-error" message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="tower-status" required>
            Status
          </RequiredLabel>
          <select
            id="tower-status"
            className={controlClassName}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "tower-status-error" : "tower-status-hint"}
            {...form.register("status")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {!errors.status ? (
            <FieldHint id="tower-status-hint">
              Inactive towers remain visible but unavailable for new allocations.
            </FieldHint>
          ) : null}
          <FieldError id="tower-status-error" message={errors.status?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="tower-floors" required>
            Number of floors
          </RequiredLabel>
          <div className="relative">
            <Layers3
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <input
              id="tower-floors"
              type="number"
              min={1}
              max={200}
              inputMode="numeric"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.numberOfFloors)}
              aria-describedby={
                errors.numberOfFloors ? "tower-floors-error" : undefined
              }
              {...form.register("numberOfFloors", { valueAsNumber: true })}
            />
          </div>
          <FieldError
            id="tower-floors-error"
            message={errors.numberOfFloors?.message}
          />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="tower-flats" required>
            Total flats
          </RequiredLabel>
          <div className="relative">
            <House
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <input
              id="tower-flats"
              type="number"
              min={1}
              max={5000}
              inputMode="numeric"
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.totalFlats)}
              aria-describedby={errors.totalFlats ? "tower-flats-error" : undefined}
              {...form.register("totalFlats", { valueAsNumber: true })}
            />
          </div>
          <FieldError
            id="tower-flats-error"
            message={errors.totalFlats?.message}
          />
        </div>
      </FormSection>

      <FormSection
        title="Description"
        description="Help the committee identify this tower at a glance."
        icon={<FileText />}
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="tower-description">Description</RequiredLabel>
          <textarea
            id="tower-description"
            rows={5}
            maxLength={500}
            placeholder="Add location, facilities, access notes, or other useful details."
            className={cn(controlClassName, "h-auto min-h-28 resize-y py-3")}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description
                ? "tower-description-error"
                : "tower-description-counter"
            }
            {...form.register("description")}
          />
          <CharacterCounter
            current={description.length}
            max={500}
            className="mt-1"
          />
          <span id="tower-description-counter" className="sr-only">
            Description is limited to 500 characters.
          </span>
          <FieldError
            id="tower-description-error"
            message={errors.description?.message}
          />
        </div>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
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
              ? "Adding tower..."
              : "Saving changes..."
            : mode === "create"
              ? "Add tower"
              : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}
