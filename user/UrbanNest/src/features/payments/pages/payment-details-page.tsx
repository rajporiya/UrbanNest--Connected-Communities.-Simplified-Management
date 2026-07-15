import { useEffect } from "react"
import { ArrowLeft, CreditCard, FileCheck2, ReceiptText, UserRound } from "lucide-react"
import { useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"

import { ContentCard, StatusBadge, UserIdentity } from "@/components/common"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { PaymentActions } from "@/features/payments/components/payment-actions"
import { clearSelectedPayment, fetchPaymentDetails, type PaymentsState } from "@/features/payments/store/payments.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not available"
export function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch(); const { selectedTransaction: payment, detailsLoading, error } = useSelector((state: { payments: PaymentsState }) => state.payments); const role = useSelector((state: { auth: { user: { role: string } | null } }) => state.auth.user?.role)
  useEffect(() => { dispatch(clearSelectedPayment()); if (!id) return; const request = dispatch(fetchPaymentDetails(id)); return () => { request.abort(); dispatch(clearSelectedPayment()) } }, [dispatch, id])
  if (detailsLoading) return <LoadingState label="Loading payment details..." className="py-20" />
  if (!id || error || !payment || payment.id !== id) return <ErrorState title="Payment not found" description={error ?? "The requested transaction is unavailable."} backAction={<Button variant="outline" render={<Link to={ROUTES.PAYMENTS} />}>Back to payments</Button>} />
  const canRefund = role === ROLES.COMMITTEE_HEAD
  const rows = [["Gateway", payment.gateway], ["Order ID", payment.gatewayOrderId], ["Payment ID", payment.gatewayPaymentId ?? "Not issued"], ["Method", payment.method], ["Created", date(payment.createdAt)], ["Completed", date(payment.completedAt)]]
  return <div className="space-y-6"><PageHeader title={payment.receiptNumber ?? "Payment attempt"} description={`${payment.billNumber} · ${money(payment.amount)}`} badge={<StatusBadge status={payment.status} />} icon={<CreditCard />} breadcrumbs={<Link className="inline-flex items-center gap-1" to={ROUTES.PAYMENTS}><ArrowLeft className="size-4" />Payments</Link>} actions={<PaymentActions transaction={payment} canRefund={canRefund} />} /><div className="grid gap-6 lg:grid-cols-[2fr_1fr]"><ContentCard title="Transaction details" icon={<FileCheck2 />}><dl className="grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-all text-sm font-medium">{value}</dd></div>)}</dl>{payment.failureReason ? <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{payment.failureReason}</p> : null}</ContentCard><div className="space-y-6"><ContentCard title="Payer" icon={<UserRound />} compact><UserIdentity name={payment.residentName} primaryText={payment.flatNumber} secondaryText={payment.billNumber} /></ContentCard><ContentCard title="Receipt" icon={<ReceiptText />} compact><p className="text-2xl font-semibold">{money(payment.amount)}</p><p className="mt-1 text-xs text-muted-foreground">{payment.receiptNumber ?? "Receipt pending"}</p></ContentCard></div></div></div>
}
