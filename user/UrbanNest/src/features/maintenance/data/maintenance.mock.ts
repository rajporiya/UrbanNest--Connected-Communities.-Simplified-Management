import type { MaintenanceBill, MaintenancePaymentStatus } from "@/features/maintenance/types/maintenance.types"

export const maintenanceTowerOptions = [
  { id: "tower-a", label: "Tower A" },
  { id: "tower-b", label: "Tower B" },
  { id: "tower-c", label: "Tower C" },
] as const

export const maintenanceResidents = [
  { id: "mock-resident", name: "Raj Poriya", email: "resident@urbannest.local", towerId: "tower-a", towerName: "Tower A", flatNumber: "A-101" },
  { id: "resident-2", name: "Diya Shah", email: "diya@urbannest.test", towerId: "tower-a", towerName: "Tower A", flatNumber: "A-201" },
  { id: "resident-3", name: "Rohan Iyer", email: "rohan@urbannest.test", towerId: "tower-b", towerName: "Tower B", flatNumber: "B-101" },
  { id: "resident-4", name: "Meera Rao", email: "meera@urbannest.test", towerId: "tower-b", towerName: "Tower B", flatNumber: "B-704" },
  { id: "resident-5", name: "Anaya Nair", email: "anaya@urbannest.test", towerId: "tower-c", towerName: "Tower C", flatNumber: "C-302" },
] as const

const seed: ReadonlyArray<readonly [string, number, MaintenancePaymentStatus, number, number]> = [
  ["mock-resident", 4850, "paid", 0, 4850],
  ["resident-2", 5200, "pending", 0, 0],
  ["resident-3", 4650, "overdue", 350, 0],
  ["resident-4", 5900, "partially_paid", 0, 2500],
  ["resident-5", 4800, "pending", 0, 0],
  ["mock-resident", 4750, "paid", 0, 4750],
  ["resident-2", 5100, "paid", 0, 5100],
  ["resident-3", 4550, "paid", 0, 4550],
  ["resident-4", 5800, "overdue", 500, 0],
  ["resident-5", 4700, "paid", 0, 4700],
]

export const maintenanceBillsMock: MaintenanceBill[] = seed.map(([residentId, base, status, fine, paid], index) => {
  const resident = maintenanceResidents.find((item) => item.id === residentId)!
  const month = index < 5 ? "2026-07" : "2026-06"
  const total = base + fine
  return {
    id: `bill-${index + 1}`,
    billNumber: `UN-MNT-${month.replace("-", "")}-${String(index + 1).padStart(3, "0")}`,
    residentId,
    residentName: resident.name,
    residentEmail: resident.email,
    towerId: resident.towerId,
    towerName: resident.towerName,
    flatNumber: resident.flatNumber,
    billingMonth: month,
    issuedAt: `${month}-01T09:00:00.000Z`,
    dueDate: `${month}-15T23:59:59.000Z`,
    charges: [
      { id: `charge-${index}-maintenance`, label: "Common area maintenance", amount: base - 650 },
      { id: `charge-${index}-water`, label: "Water charges", amount: 350 },
      { id: `charge-${index}-fund`, label: "Sinking fund", amount: 300 },
    ],
    subtotal: base,
    fineAmount: fine,
    amountPaid: paid,
    totalAmount: total,
    status,
    notes: fine ? "Late payment fine applied after the grace period." : "Pay before the due date to avoid a late fee.",
    payments: paid > 0 ? [{ id: `payment-${index + 1}`, amount: paid, method: "UPI", paidAt: `${month}-08T11:45:00.000Z`, reference: `PAY${100000 + index}` }] : [],
  }
})
