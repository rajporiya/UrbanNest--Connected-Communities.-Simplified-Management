import { useEffect } from "react"
import { ArrowLeft, CalendarDays, CreditCard, ReceiptText, UserRound } from "lucide-react"
import { useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"

import { ContentCard, UserIdentity } from "@/components/common"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { MaintenanceBillActions } from "@/features/maintenance/components/maintenance-bill-actions"
import { MaintenanceStatusBadge } from "@/features/maintenance/components/maintenance-status-badge"
import { clearSelectedMaintenanceBill, fetchMaintenanceBill, type MaintenanceState } from "@/features/maintenance/store/maintenance.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
const date = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))

export function MaintenanceBillDetailsPage() {
  const { id } = useParams<{ id: string }>(); const dispatch = useAppDispatch()
  const { selectedBill: bill, detailsLoading, error } = useSelector((state: { maintenance: MaintenanceState }) => state.maintenance)
  const role = useSelector((state: { auth: { user: { role: string } | null } }) => state.auth.user?.role)
  useEffect(() => { dispatch(clearSelectedMaintenanceBill()); if (!id) return; const request = dispatch(fetchMaintenanceBill(id)); return () => { request.abort(); dispatch(clearSelectedMaintenanceBill()) } }, [dispatch, id])
  if (detailsLoading) return <LoadingState label="Loading maintenance bill..." className="py-20" />
  if (!id || error || !bill || bill.id !== id) return <ErrorState title="Maintenance bill not found" description={error ?? "This bill is unavailable."} backAction={<Button variant="outline" render={<Link to={ROUTES.MAINTENANCE} />}>Back to bills</Button>} />
  const canManage = role === ROLES.COMMITTEE_HEAD || role === ROLES.COMMITTEE_MEMBER
  return <div className="space-y-6"><PageHeader title={bill.billNumber} description={`${bill.billingMonth} maintenance for ${bill.flatNumber}`} badge={<MaintenanceStatusBadge status={bill.status} />} icon={<ReceiptText />} breadcrumbs={<Link className="inline-flex items-center gap-1" to={ROUTES.MAINTENANCE}><ArrowLeft className="size-4" />Maintenance bills</Link>} actions={<MaintenanceBillActions bill={bill} canManage={canManage} />} /><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><ContentCard title="Charge breakdown" description="Itemized bill and fine preview." icon={<ReceiptText />}><dl className="space-y-3">{bill.charges.map((charge) => <div key={charge.id} className="flex justify-between gap-4 border-b pb-3"><dt>{charge.label}</dt><dd className="font-medium">{money(charge.amount)}</dd></div>)}<div className="flex justify-between gap-4 text-destructive"><dt>Fine</dt><dd>{money(bill.fineAmount)}</dd></div><div className="flex justify-between gap-4 rounded-lg bg-muted p-4 text-lg font-semibold"><dt>Total</dt><dd>{money(bill.totalAmount)}</dd></div><div className="flex justify-between gap-4 text-sm"><dt>Paid</dt><dd>{money(bill.amountPaid)}</dd></div></dl></ContentCard><div className="space-y-6"><ContentCard title="Resident" icon={<UserRound />} compact><UserIdentity name={bill.residentName} primaryText={bill.residentEmail} secondaryText={`${bill.towerName} · ${bill.flatNumber}`} /></ContentCard><ContentCard title="Schedule" icon={<CalendarDays />} compact><dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Issued</dt><dd className="font-medium">{date(bill.issuedAt)}</dd></div><div><dt className="text-muted-foreground">Due date</dt><dd className="font-medium">{date(bill.dueDate)}</dd></div></dl></ContentCard></div></div><ContentCard title="Payment transactions" icon={<CreditCard />}>{bill.payments.length ? <div className="space-y-3">{bill.payments.map((payment) => <div key={payment.id} className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row"><div><p className="font-medium">{payment.method} · {payment.reference}</p><p className="text-xs text-muted-foreground">{date(payment.paidAt)}</p></div><p className="font-semibold text-emerald-600">{money(payment.amount)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No payment has been recorded for this bill.</p>}</ContentCard></div>
}
