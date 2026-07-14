import { z } from "zod"

export const maintenanceBillSchema = z.object({
  residentId: z.string().min(1, "Resident is required"),
  billingMonth: z.string().regex(/^\d{4}-\d{2}$/, "Billing month is required"),
  dueDate: z.string().min(1, "Due date is required"),
  baseAmount: z.number().min(1, "Base amount must be greater than zero").max(1_000_000),
  waterCharge: z.number().min(0).max(1_000_000),
  sinkingFund: z.number().min(0).max(1_000_000),
  parkingCharge: z.number().min(0).max(1_000_000),
  fineAmount: z.number().min(0).max(1_000_000),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters"),
})

export type MaintenanceBillFormValues = z.infer<typeof maintenanceBillSchema>

export const maintenanceBillDefaultValues: MaintenanceBillFormValues = {
  residentId: "",
  billingMonth: new Date().toISOString().slice(0, 7),
  dueDate: "",
  baseAmount: 4000,
  waterCharge: 350,
  sinkingFund: 300,
  parkingCharge: 0,
  fineAmount: 0,
  notes: "",
}

export const maintenanceFineSchema = z.object({
  amount: z.number().min(0, "Fine cannot be negative").max(100_000),
})

export type MaintenanceFineFormValues = z.infer<typeof maintenanceFineSchema>
