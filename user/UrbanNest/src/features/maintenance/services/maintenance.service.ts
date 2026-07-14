import { maintenanceBillsMock } from "@/features/maintenance/data/maintenance.mock"
import type { GenerateMaintenanceBillRequest, MaintenanceBill, MaintenanceBillListResponse, MaintenanceBillQuery, MaintenancePaymentStatus } from "@/features/maintenance/types/maintenance.types"

const clone = <T,>(value: T): T => structuredClone(value)
const wait = () => new Promise<void>((resolve) => globalThis.setTimeout(resolve, 180))
let store = clone(maintenanceBillsMock)

const getIndex = (id: string) => {
  const index = store.findIndex((bill) => bill.id === id)
  if (index < 0) throw new Error("Maintenance bill not found")
  return index
}

const normalized = (value: string) => value.trim().toLocaleLowerCase()

export const maintenanceService = {
  async list(query: MaintenanceBillQuery = {}): Promise<MaintenanceBillListResponse> {
    await wait()
    let items = clone(store)
    const search = normalized(query.search ?? "")
    if (search) items = items.filter((item) => [item.billNumber, item.residentName, item.flatNumber, item.towerName].some((value) => normalized(value).includes(search)))
    if (query.status) items = items.filter((item) => item.status === query.status)
    if (query.towerId) items = items.filter((item) => item.towerId === query.towerId)
    if (query.month) items = items.filter((item) => item.billingMonth === query.month)
    if (query.residentId) items = items.filter((item) => item.residentId === query.residentId)
    items.sort((left, right) => {
      switch (query.sort ?? "due_desc") {
        case "due_asc": return Date.parse(left.dueDate) - Date.parse(right.dueDate)
        case "amount_asc": return left.totalAmount - right.totalAmount
        case "amount_desc": return right.totalAmount - left.totalAmount
        case "newest": return Date.parse(right.issuedAt) - Date.parse(left.issuedAt)
        default: return Date.parse(right.dueDate) - Date.parse(left.dueDate)
      }
    })
    const limit = Math.max(1, Math.trunc(query.limit ?? 10))
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(totalPages, Math.max(1, Math.trunc(query.page ?? 1)))
    return { items: items.slice((page - 1) * limit, page * limit), page, limit, total, totalPages }
  },
  async details(id: string): Promise<MaintenanceBill> {
    await wait()
    return clone(store[getIndex(id)])
  },
  async generate(request: GenerateMaintenanceBillRequest): Promise<MaintenanceBill> {
    await wait()
    const charges = [
      { id: crypto.randomUUID(), label: "Common area maintenance", amount: request.baseAmount },
      { id: crypto.randomUUID(), label: "Water charges", amount: request.waterCharge },
      { id: crypto.randomUUID(), label: "Sinking fund", amount: request.sinkingFund },
      { id: crypto.randomUUID(), label: "Parking charges", amount: request.parkingCharge },
    ].filter((charge) => charge.amount > 0)
    const subtotal = charges.reduce((sum, charge) => sum + charge.amount, 0)
    const now = new Date().toISOString()
    const bill: MaintenanceBill = {
      id: `bill-${crypto.randomUUID()}`,
      billNumber: `UN-MNT-${request.billingMonth.replace("-", "")}-${String(store.length + 1).padStart(3, "0")}`,
      residentId: request.residentId,
      residentName: request.residentName,
      residentEmail: request.residentEmail,
      towerId: request.towerId,
      towerName: request.towerName,
      flatNumber: request.flatNumber,
      billingMonth: request.billingMonth,
      issuedAt: now,
      dueDate: new Date(`${request.dueDate}T23:59:59`).toISOString(),
      charges,
      subtotal,
      fineAmount: request.fineAmount,
      amountPaid: 0,
      totalAmount: subtotal + request.fineAmount,
      status: "pending",
      notes: request.notes,
      payments: [],
    }
    store = [bill, ...store]
    return clone(bill)
  },
  async applyFine(id: string, amount: number): Promise<MaintenanceBill> {
    await wait()
    const index = getIndex(id)
    const current = store[index]
    const next: MaintenanceBill = { ...current, fineAmount: amount, totalAmount: current.subtotal + amount, status: current.amountPaid > 0 ? "partially_paid" : amount > 0 ? "overdue" : "pending" }
    store[index] = next
    return clone(next)
  },
  async setStatus(id: string, status: MaintenancePaymentStatus): Promise<MaintenanceBill> {
    await wait()
    const index = getIndex(id)
    const current = store[index]
    const next: MaintenanceBill = { ...current, status, amountPaid: status === "paid" ? current.totalAmount : current.amountPaid }
    store[index] = next
    return clone(next)
  },
}
