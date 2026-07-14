import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  DoorOpen,
  House,
  Layers3,
  LoaderCircle,
  Maximize2,
  UserRound,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { useEffect, useState } from "react"

import { FieldHint } from "@/components/forms/field-hint"
import { FormActions } from "@/components/forms/form-actions"
import { FormSection } from "@/components/forms/form-section"
import { RequiredLabel } from "@/components/forms/required-label"
import { Button } from "@/components/ui/button"
import {
  bhkTypeOptions,
  flatTowerOptions,
  occupancyStatusOptions,
} from "@/features/flats/data/flats.mock"
import {
  flatFormSchema,
  type FlatFormValues,
} from "@/features/flats/schemas/flat.schema"
import { cn } from "@/lib/utils"
import { towerService } from "@/features/towers/services/tower.service"
import type { FlatTower } from "@/features/flats/types/flat.types"

export interface FlatFormProps {
  mode: "create" | "edit"
  initialValues: FlatFormValues
  isSubmitting?: boolean
  onSubmit: (values: FlatFormValues) => void | Promise<void>
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

export function FlatForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: FlatFormProps) {
  const [towerOptions, setTowerOptions] = useState<FlatTower[]>(flatTowerOptions)
  const form = useForm<FlatFormValues>({
    resolver: zodResolver(flatFormSchema),
    defaultValues: initialValues,
  })
  const { errors } = form.formState
  const towerId = useWatch({ control: form.control, name: "towerId" })
  const occupancyStatus = useWatch({ control: form.control, name: "occupancyStatus" })
  const selectedTower = towerOptions.find((tower) => tower.id === towerId)

  useEffect(() => {
    let active = true
    void towerService
      .getTowers({ page: 1, limit: 100, status: "active", sort: "name_asc" })
      .then((response) => {
        if (!active) return
        setTowerOptions(response.items.map((tower) => ({
          id: tower.id,
          name: tower.name,
          totalFloors: tower.numberOfFloors,
        })))
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const handleValidSubmit = (values: FlatFormValues) => {
    const tower = towerOptions.find((item) => item.id === values.towerId)
    if (tower && values.floorNumber > tower.totalFloors) {
      form.setError("floorNumber", {
        type: "validate",
        message: `${tower.name} has only ${tower.totalFloors} floors`,
      })
      return
    }
    return onSubmit(values)
  }

  return (
    <form className="min-w-0 space-y-8" noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
      <FormSection
        title="Flat location"
        description="Choose the tower and identify the flat within it."
        icon={<Building2 />}
        columns={2}
        divider
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-tower" required>Tower</RequiredLabel>
          <div className="relative">
            <Building2 aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <select
              id="flat-tower"
              className={cn(controlClassName, "appearance-none pl-10")}
              aria-invalid={Boolean(errors.towerId)}
              aria-describedby={errors.towerId ? "flat-tower-error" : "flat-tower-hint"}
              {...form.register("towerId")}
            >
              <option value="">Select a tower</option>
              {towerOptions.map((tower) => (
                <option key={tower.id} value={tower.id}>{tower.name}</option>
              ))}
            </select>
          </div>
          {!errors.towerId ? (
            <FieldHint id="flat-tower-hint">
              {selectedTower ? `${selectedTower.name} has ${selectedTower.totalFloors} floors.` : "Select the tower containing this flat."}
            </FieldHint>
          ) : null}
          <FieldError id="flat-tower-error" message={errors.towerId?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-floor" required>Floor</RequiredLabel>
          <div className="relative">
            <Layers3 aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="flat-floor"
              type="number"
              inputMode="numeric"
              min={0}
              max={selectedTower?.totalFloors ?? 200}
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.floorNumber)}
              aria-describedby={errors.floorNumber ? "flat-floor-error" : "flat-floor-hint"}
              {...form.register("floorNumber", { valueAsNumber: true })}
            />
          </div>
          {!errors.floorNumber ? <FieldHint id="flat-floor-hint">Use 0 for a ground-floor flat.</FieldHint> : null}
          <FieldError id="flat-floor-error" message={errors.floorNumber?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-number" required>Flat number</RequiredLabel>
          <div className="relative">
            <DoorOpen aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="flat-number"
              type="text"
              autoCapitalize="characters"
              placeholder="e.g. A-302"
              className={cn(controlClassName, "pl-10 uppercase")}
              aria-invalid={Boolean(errors.flatNumber)}
              aria-describedby={errors.flatNumber ? "flat-number-error" : undefined}
              {...form.register("flatNumber")}
            />
          </div>
          <FieldError id="flat-number-error" message={errors.flatNumber?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-bhk" required>BHK type</RequiredLabel>
          <select
            id="flat-bhk"
            className={controlClassName}
            aria-invalid={Boolean(errors.bhkType)}
            aria-describedby={errors.bhkType ? "flat-bhk-error" : undefined}
            {...form.register("bhkType")}
          >
            {bhkTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <FieldError id="flat-bhk-error" message={errors.bhkType?.message} />
        </div>
      </FormSection>

      <FormSection
        title="Occupancy information"
        description="Record the usable area, current occupancy, and owner."
        icon={<House />}
        columns={2}
      >
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-area" required>Area (sq ft)</RequiredLabel>
          <div className="relative">
            <Maximize2 aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="flat-area"
              type="number"
              inputMode="numeric"
              min={100}
              max={50_000}
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.areaSqFt)}
              aria-describedby={errors.areaSqFt ? "flat-area-error" : undefined}
              {...form.register("areaSqFt", { valueAsNumber: true })}
            />
          </div>
          <FieldError id="flat-area-error" message={errors.areaSqFt?.message} />
        </div>

        <div className="space-y-1.5">
          <RequiredLabel htmlFor="flat-occupancy" required>Occupancy status</RequiredLabel>
          <select
            id="flat-occupancy"
            className={controlClassName}
            aria-invalid={Boolean(errors.occupancyStatus)}
            aria-describedby={errors.occupancyStatus ? "flat-occupancy-error" : undefined}
            {...form.register("occupancyStatus")}
          >
            {occupancyStatusOptions.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.charAt(0).toLocaleUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <FieldError id="flat-occupancy-error" message={errors.occupancyStatus?.message} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <RequiredLabel htmlFor="flat-owner" required={occupancyStatus === "occupied"}>Owner</RequiredLabel>
          <div className="relative">
            <UserRound aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <input
              id="flat-owner"
              type="text"
              autoComplete="name"
              placeholder={occupancyStatus === "occupied" ? "Owner's full name" : "Optional owner or reservation name"}
              readOnly={occupancyStatus === "vacant"}
              aria-disabled={occupancyStatus === "vacant"}
              className={cn(controlClassName, "pl-10")}
              aria-invalid={Boolean(errors.ownerName)}
              aria-describedby={errors.ownerName ? "flat-owner-error" : "flat-owner-hint"}
              {...form.register("ownerName")}
            />
          </div>
          {!errors.ownerName ? (
            <FieldHint id="flat-owner-hint">
              {occupancyStatus === "vacant"
                ? "Vacant flats do not have an assigned owner in this directory."
                : occupancyStatus === "occupied"
                  ? "An owner is required while the flat is occupied."
                  : "Optionally record the person for whom this flat is reserved."}
            </FieldHint>
          ) : null}
          <FieldError id="flat-owner-error" message={errors.ownerName?.message} />
        </div>
      </FormSection>

      <FormActions className="border-t border-border pt-5">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
          {isSubmitting
            ? mode === "create" ? "Adding flat..." : "Saving changes..."
            : mode === "create" ? "Add flat" : "Save changes"}
        </Button>
      </FormActions>
    </form>
  )
}
