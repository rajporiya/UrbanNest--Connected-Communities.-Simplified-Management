import { paymentsMock } from "@/features/payments/data/payments.mock"
import type { CreatePaymentRequest, PaymentListResponse, PaymentQuery, PaymentTransaction } from "@/features/payments/types/payment.types"

const clone = <T,>(value: T): T => structuredClone(value)
const wait = (duration = 220) => new Promise<void>((resolve) => globalThis.setTimeout(resolve, duration))
let store = clone(paymentsMock)
const getIndex = (id: string) => { const index = store.findIndex((item) => item.id === id); if (index < 0) throw new Error("Payment transaction not found"); return index }

export const paymentService = {
  async list(query: PaymentQuery = {}): Promise<PaymentListResponse> {
    await wait()
    let items = clone(store); const search = (query.search ?? "").trim().toLocaleLowerCase()
    if (search) items = items.filter((item) => [item.billNumber, item.receiptNumber ?? "", item.residentName, item.flatNumber, item.gatewayPaymentId ?? ""].some((value) => value.toLocaleLowerCase().includes(search)))
    if (query.status) items = items.filter((item) => item.status === query.status)
    if (query.method) items = items.filter((item) => item.method === query.method)
    if (query.residentId) items = items.filter((item) => item.residentId === query.residentId)
    items.sort((left, right) => { switch (query.sort ?? "newest") { case "oldest": return Date.parse(left.createdAt) - Date.parse(right.createdAt); case "amount_desc": return right.amount - left.amount; case "amount_asc": return left.amount - right.amount; default: return Date.parse(right.createdAt) - Date.parse(left.createdAt) } })
    const limit = Math.max(1, Math.trunc(query.limit ?? 10)); const total = items.length; const totalPages = Math.max(1, Math.ceil(total / limit)); const page = Math.min(totalPages, Math.max(1, Math.trunc(query.page ?? 1)))
    return { items: items.slice((page - 1) * limit, page * limit), page, limit, total, totalPages }
  },
  async details(id: string): Promise<PaymentTransaction> { await wait(); return clone(store[getIndex(id)]) },
  async checkout(request: CreatePaymentRequest): Promise<PaymentTransaction> {
    await wait(700)
    const now = new Date().toISOString(); const id = `transaction-${crypto.randomUUID()}`; const failed = request.simulateFailure
    const transaction: PaymentTransaction = { id, receiptNumber: failed ? null : `UN-RCT-${Date.now()}`, billId: request.billId, billNumber: request.billNumber, residentId: request.residentId, residentName: request.residentName, flatNumber: request.flatNumber, amount: request.amount, status: failed ? "failed" : "paid", method: request.method, gateway: "Razorpay Mock", gatewayOrderId: `order_mock_${crypto.randomUUID().slice(0, 8)}`, gatewayPaymentId: failed ? null : `pay_mock_${crypto.randomUUID().slice(0, 8)}`, createdAt: now, completedAt: failed ? null : now, failureReason: failed ? "The mock payment was declined as requested." : null }
    store = [transaction, ...store]; return clone(transaction)
  },
  async refund(id: string): Promise<PaymentTransaction> { await wait(); const index = getIndex(id); const current = store[index]; if (current.status !== "paid") throw new Error("Only paid transactions can be refunded"); const next: PaymentTransaction = { ...current, status: "refunded" }; store[index] = next; return clone(next) },
  receiptText(transaction: PaymentTransaction): string { if (transaction.status !== "paid" || !transaction.receiptNumber) throw new Error("A receipt is available only for successful payments"); return [`UrbanNest Payment Receipt`, `Receipt: ${transaction.receiptNumber}`, `Bill: ${transaction.billNumber}`, `Resident: ${transaction.residentName}`, `Flat: ${transaction.flatNumber}`, `Amount: INR ${transaction.amount.toFixed(2)}`, `Method: ${transaction.method}`, `Payment ID: ${transaction.gatewayPaymentId ?? "-"}`, `Paid at: ${transaction.completedAt ?? transaction.createdAt}`].join("\n") },
}
