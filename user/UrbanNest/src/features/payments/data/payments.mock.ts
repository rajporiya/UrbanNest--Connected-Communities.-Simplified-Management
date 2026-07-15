import type { PaymentMethod, PaymentStatus, PaymentTransaction } from "@/features/payments/types/payment.types"

export const paymentMethodOptions: PaymentMethod[] = ["UPI", "Card", "Net Banking", "Wallet"]

const rows: ReadonlyArray<readonly [string, string, string, number, PaymentStatus, PaymentMethod, string]> = [
  ["Aarav Mehta", "A-101", "UN-MNT-202607-001", 4850, "paid", "UPI", "2026-07-08"],
  ["Diya Shah", "A-201", "UN-MNT-202607-002", 5200, "pending", "Card", "2026-07-09"],
  ["Rohan Iyer", "B-101", "UN-MNT-202607-003", 5000, "failed", "Net Banking", "2026-07-10"],
  ["Meera Rao", "B-704", "UN-MNT-202607-004", 2500, "paid", "UPI", "2026-07-11"],
  ["Anaya Nair", "C-302", "UN-MNT-202606-010", 4700, "refunded", "Card", "2026-06-12"],
  ["Aarav Mehta", "A-101", "UN-MNT-202606-006", 4750, "paid", "Wallet", "2026-06-08"],
  ["Diya Shah", "A-201", "UN-MNT-202606-007", 5100, "paid", "UPI", "2026-06-09"],
  ["Rohan Iyer", "B-101", "UN-MNT-202606-008", 4550, "paid", "Net Banking", "2026-06-10"],
]

export const paymentsMock: PaymentTransaction[] = rows.map(([residentName, flatNumber, billNumber, amount, status, method, day], index) => ({
  id: `transaction-${index + 1}`,
  receiptNumber: status === "paid" ? `UN-RCT-${String(index + 1).padStart(5, "0")}` : null,
  billId: `bill-${index + 1}`,
  billNumber,
  residentId: index % 5 === 0 ? "mock-resident" : `resident-${(index % 5) + 1}`,
  residentName,
  flatNumber,
  amount,
  status,
  method,
  gateway: "Razorpay Mock",
  gatewayOrderId: `order_mock_${10000 + index}`,
  gatewayPaymentId: status === "paid" ? `pay_mock_${20000 + index}` : null,
  createdAt: `${day}T10:30:00.000Z`,
  completedAt: status === "paid" ? `${day}T10:31:30.000Z` : null,
  failureReason: status === "failed" ? "Payment authorization was declined by the mock bank." : null,
}))
