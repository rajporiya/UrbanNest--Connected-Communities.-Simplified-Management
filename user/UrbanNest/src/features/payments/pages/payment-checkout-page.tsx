import { ArrowLeft, CreditCard } from "lucide-react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { PaymentCheckoutForm } from "@/features/payments/components/payment-checkout-form"
import { paymentCheckoutDefaults, type PaymentCheckoutFormValues } from "@/features/payments/schemas/payment.schema"
import { checkoutPayment, type PaymentsState } from "@/features/payments/store/payments.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function PaymentCheckoutPage() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const loading = useSelector((state: { payments: PaymentsState }) => state.payments.checkoutLoading)
  const submit = async (values: PaymentCheckoutFormValues) => { try { const payment = await dispatch(checkoutPayment({ ...values, residentId: "resident-2" })).unwrap(); navigate(`${ROUTES.PAYMENTS}/${payment.status === "paid" ? "success" : "failed"}/${payment.id}`, { replace: true }) } catch (error) { toast.error(typeof error === "string" ? error : "Payment could not be processed.") } }
  return <div className="space-y-6"><PageHeader title="Mock payment checkout" description="Test a Razorpay-style payment journey without sending real funds." icon={<CreditCard />} breadcrumbs={<Link className="inline-flex items-center gap-1" to={ROUTES.PAYMENTS}><ArrowLeft className="size-4" />Payments</Link>} /><Card><CardContent className="pt-6"><PaymentCheckoutForm initialValues={paymentCheckoutDefaults} submitting={loading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div>
}
