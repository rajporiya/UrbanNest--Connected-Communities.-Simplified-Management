import { z } from "zod"

export const paymentCheckoutSchema = z.object({
  billId: z.string().min(1, "Bill ID is required"),
  billNumber: z.string().trim().min(1, "Bill number is required"),
  residentName: z.string().trim().min(2, "Resident name is required"),
  flatNumber: z.string().trim().min(1, "Flat number is required"),
  amount: z.number().min(1, "Amount must be greater than zero").max(1_000_000),
  method: z.enum(["UPI", "Card", "Net Banking", "Wallet"]),
  payerEmail: z.email("Enter a valid email address"),
  payerMobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  simulateFailure: z.boolean(),
})

export type PaymentCheckoutFormValues = z.infer<typeof paymentCheckoutSchema>

export const paymentCheckoutDefaults: PaymentCheckoutFormValues = {
  billId: "bill-2",
  billNumber: "UN-MNT-202607-002",
  residentName: "Diya Shah",
  flatNumber: "A-201",
  amount: 5200,
  method: "UPI",
  payerEmail: "diya@urbannest.test",
  payerMobile: "9876543210",
  simulateFailure: false,
}
