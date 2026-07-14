export type MaintenancePaymentStatus = "paid" | "pending" | "overdue" | "partially_paid"
export type MaintenanceSort = "due_asc" | "due_desc" | "amount_asc" | "amount_desc" | "newest"

export interface MaintenanceCharge {
  id: string
  label: string
  amount: number
}

export interface MaintenancePayment {
  id: string
  amount: number
  method: "UPI" | "Card" | "Net Banking" | "Cash"
  paidAt: string
  reference: string
}

export interface MaintenanceBill {
  id: string
  billNumber: string
  residentId: string
  residentName: string
  residentEmail: string
  towerId: string
  towerName: string
  flatNumber: string
  billingMonth: string
  issuedAt: string
  dueDate: string
  charges: MaintenanceCharge[]
  subtotal: number
  fineAmount: number
  amountPaid: number
  totalAmount: number
  status: MaintenancePaymentStatus
  notes: string
  payments: MaintenancePayment[]
}

export interface MaintenanceBillQuery {
  page?: number
  limit?: number
  search?: string
  towerId?: string
  status?: MaintenancePaymentStatus
  month?: string
  residentId?: string
  sort?: MaintenanceSort
}

export interface MaintenanceBillListResponse {
  items: MaintenanceBill[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface GenerateMaintenanceBillRequest {
  residentId: string
  residentName: string
  residentEmail: string
  towerId: string
  towerName: string
  flatNumber: string
  billingMonth: string
  dueDate: string
  baseAmount: number
  waterCharge: number
  sinkingFund: number
  parkingCharge: number
  fineAmount: number
  notes: string
}

export interface ApplyMaintenanceFineRequest {
  id: string
  amount: number
}

export interface UpdateMaintenanceStatusRequest {
  id: string
  status: MaintenancePaymentStatus
}
