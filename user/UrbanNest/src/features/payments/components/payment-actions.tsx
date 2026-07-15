import { useState } from "react"
import { Download, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { refundPayment } from "@/features/payments/store/payments.slice"
import type { PaymentTransaction } from "@/features/payments/types/payment.types"
import { downloadPaymentReceipt } from "@/features/payments/utils/download-payment-receipt"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function PaymentActions({ transaction, canRefund = false }: { transaction: PaymentTransaction; canRefund?: boolean }) {
  const dispatch = useAppDispatch(); const [confirm, setConfirm] = useState(false); const [loading, setLoading] = useState(false)
  const refund = async () => { if (loading) return; setLoading(true); try { await dispatch(refundPayment(transaction.id)).unwrap(); toast.success("Refund recorded in the mock ledger."); setConfirm(false) } catch (error) { toast.error(typeof error === "string" ? error : "Refund could not be recorded.") } finally { setLoading(false) } }
  return <><div className="flex flex-wrap gap-2">{transaction.status === "paid" ? <Button size="sm" variant="outline" onClick={() => downloadPaymentReceipt(transaction)}><Download />Download receipt</Button> : null}{canRefund && transaction.status === "paid" ? <Button size="sm" variant="destructive" onClick={() => setConfirm(true)}><RotateCcw />Refund</Button> : null}</div><ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Record refund?" description="The transaction will be marked as refunded in the mock payment ledger." confirmLabel="Record refund" destructive loading={loading} onConfirm={refund} /></>
}
