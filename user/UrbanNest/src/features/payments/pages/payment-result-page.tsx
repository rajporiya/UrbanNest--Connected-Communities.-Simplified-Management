import { CheckCircle2, CircleX, ReceiptText, RotateCcw } from "lucide-react"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"

import { PaymentActions } from "@/features/payments/components/payment-actions"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { fetchPaymentDetails, type PaymentsState } from "@/features/payments/store/payments.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function PaymentResultPage() {
  const { id, result } = useParams<{ id: string; result: string }>(); const dispatch = useAppDispatch(); const { latestTransaction, selectedTransaction, detailsLoading, error } = useSelector((state: { payments: PaymentsState }) => state.payments); const transaction = latestTransaction?.id === id ? latestTransaction : selectedTransaction?.id === id ? selectedTransaction : null
  useEffect(() => { if (id && !transaction) void dispatch(fetchPaymentDetails(id)) }, [dispatch, id, transaction])
  if (detailsLoading) return <LoadingState label="Confirming payment result..." className="py-20" />
  if (!transaction || error) return <ErrorState title="Payment result unavailable" description={error ?? "The mock transaction could not be found."} />
  const success = result === "success" && transaction.status === "paid"; const Icon = success ? CheckCircle2 : CircleX
  return <div className="mx-auto max-w-2xl py-8"><section className="rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-10"><span className={success ? "mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive"}><Icon className="size-8" /></span><h1 className="mt-5 text-2xl font-semibold">{success ? "Payment successful" : "Payment failed"}</h1><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{success ? `Your mock payment of ₹${transaction.amount.toLocaleString("en-IN")} was recorded successfully.` : transaction.failureReason ?? "The mock payment could not be completed."}</p><div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">{success ? <PaymentActions transaction={transaction} /> : <Button render={<Link to={`${ROUTES.PAYMENTS}/checkout`} />}><RotateCcw />Try again</Button>}<Button variant="outline" render={<Link to={`${ROUTES.PAYMENTS}/${transaction.id}`} />}><ReceiptText />View transaction</Button><Button variant="ghost" render={<Link to={ROUTES.PAYMENTS} />}>Payment history</Button></div></section></div>
}

export function PaymentSuccessPage() { return <PaymentResultPage /> }
export function PaymentFailedPage() { return <PaymentResultPage /> }
