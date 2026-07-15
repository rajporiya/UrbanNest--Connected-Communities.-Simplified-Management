export type PaymentStatus = "paid" | "pending" | "failed" | "refunded"
export type PaymentMethod = "UPI" | "Card" | "Net Banking" | "Wallet"
export type PaymentSort = "newest" | "oldest" | "amount_desc" | "amount_asc"

export interface PaymentTransaction {
  id: string
  receiptNumber: string | null
  billId: string
  billNumber: string
  residentId: string
  residentName: string
  flatNumber: string
  amount: number
  status: PaymentStatus
  method: PaymentMethod
  gateway: "Razorpay Mock"
  gatewayOrderId: string
  gatewayPaymentId: string | null
  createdAt: string
  completedAt: string | null
  failureReason: string | null
}

export interface PaymentQuery {
  page?: number
  limit?: number
  search?: string
  status?: PaymentStatus
  method?: PaymentMethod
  residentId?: string
  sort?: PaymentSort
}

export interface PaymentListResponse {
  items: PaymentTransaction[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CreatePaymentRequest {
  billId: string
  billNumber: string
  residentId: string
  residentName: string
  flatNumber: string
  amount: number
  method: PaymentMethod
  payerEmail: string
  payerMobile: string
  simulateFailure: boolean
}
