import { toast } from "sonner"

import { paymentService } from "@/features/payments/services/payment.service"
import type { PaymentTransaction } from "@/features/payments/types/payment.types"

export function downloadPaymentReceipt(transaction: PaymentTransaction) {
  try {
    const blob = new Blob([paymentService.receiptText(transaction)], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${transaction.receiptNumber ?? "receipt"}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Receipt downloaded.")
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Receipt is unavailable.")
  }
}
