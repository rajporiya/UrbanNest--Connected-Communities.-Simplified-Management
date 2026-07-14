import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, CalendarDays, LoaderCircle, ReceiptText, UserRound } from "lucide-react"
import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"

import { FormActions, FormSection, RequiredLabel } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { maintenanceResidents } from "@/features/maintenance/data/maintenance.mock"
import { maintenanceBillSchema, type MaintenanceBillFormValues } from "@/features/maintenance/schemas/maintenance.schema"
import { cn } from "@/lib/utils"

export interface MaintenanceBillFormProps {
  initialValues: MaintenanceBillFormValues
  submitting?: boolean
  onSubmit: (values: MaintenanceBillFormValues) => void | Promise<void>
  onCancel: () => void
}

const control = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
function ErrorText({ message }: { message?: string }) { return message ? <p role="alert" className="text-xs font-medium text-destructive">{message}</p> : null }

export function MaintenanceBillForm({ initialValues, submitting = false, onSubmit, onCancel }: MaintenanceBillFormProps) {
  const form = useForm<MaintenanceBillFormValues>({ resolver: zodResolver(maintenanceBillSchema), defaultValues: initialValues })
  const values = useWatch({ control: form.control })
  const preview = useMemo(
    () =>
      [
        values.baseAmount,
        values.waterCharge,
        values.sinkingFund,
        values.parkingCharge,
        values.fineAmount,
      ].reduce<number>(
        (sum, value) =>
          sum + (typeof value === "number" && Number.isFinite(value) ? value : 0),
        0,
      ),
    [values],
  )
  const { errors } = form.formState
  return (
    <form noValidate className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection title="Bill recipient" description="Choose the resident and billing period." icon={<UserRound />} columns={2} divider>
        <label className="space-y-1.5 text-sm font-medium"><RequiredLabel required>Resident</RequiredLabel><select className={control} {...form.register("residentId")}><option value="">Select resident</option>{maintenanceResidents.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.flatNumber}</option>)}</select><ErrorText message={errors.residentId?.message} /></label>
        <label className="space-y-1.5 text-sm font-medium"><RequiredLabel required>Billing month</RequiredLabel><input type="month" className={control} {...form.register("billingMonth")} /><ErrorText message={errors.billingMonth?.message} /></label>
        <label className="space-y-1.5 text-sm font-medium"><RequiredLabel required>Due date</RequiredLabel><input type="date" className={control} {...form.register("dueDate")} /><ErrorText message={errors.dueDate?.message} /></label>
      </FormSection>
      <FormSection title="Charges" description="Review the live total before generating the bill." icon={<Calculator />} columns={2} divider>
        {(["baseAmount", "waterCharge", "sinkingFund", "parkingCharge", "fineAmount"] as const).map((name) => <label key={name} className="space-y-1.5 text-sm font-medium"><RequiredLabel required={name === "baseAmount"}>{({ baseAmount: "Base maintenance", waterCharge: "Water charge", sinkingFund: "Sinking fund", parkingCharge: "Parking charge", fineAmount: "Fine preview" } as const)[name]}</RequiredLabel><div className="relative"><span className="absolute left-3 top-3 text-muted-foreground">₹</span><input type="number" min={0} step="1" className={cn(control, "pl-8")} {...form.register(name, { valueAsNumber: true })} /></div><ErrorText message={errors[name]?.message} /></label>)}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:col-span-2"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Total payable</p><p className="text-2xl font-semibold">₹{preview.toLocaleString("en-IN")}</p></div><ReceiptText aria-hidden="true" className="size-8 text-primary" /></div></div>
      </FormSection>
      <FormSection title="Notes" icon={<CalendarDays />}><label className="space-y-1.5 text-sm font-medium"><span>Resident note</span><textarea rows={4} maxLength={500} className={cn(control, "h-auto py-3")} {...form.register("notes")} /><ErrorText message={errors.notes?.message} /></label></FormSection>
      <FormActions className="border-t"><Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" /> : null}{submitting ? "Generating..." : "Generate bill"}</Button></FormActions>
    </form>
  )
}
