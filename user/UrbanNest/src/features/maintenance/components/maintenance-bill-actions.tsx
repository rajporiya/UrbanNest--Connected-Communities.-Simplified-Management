import { useState } from "react"
import { BadgeIndianRupee, CheckCheck } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { Button } from "@/components/ui/button"
import { applyMaintenanceFine, updateMaintenanceStatus } from "@/features/maintenance/store/maintenance.slice"
import type { MaintenanceBill } from "@/features/maintenance/types/maintenance.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function MaintenanceBillActions({ bill, canManage = false }: { bill: MaintenanceBill; canManage?: boolean }) {
  const dispatch = useAppDispatch()
  const [action, setAction] = useState<"fine" | "paid" | null>(null)
  const [loading, setLoading] = useState(false)
  if (!canManage || bill.status === "paid") return null
  const execute = async () => {
    if (!action || loading) return
    setLoading(true)
    try {
      if (action === "fine") await dispatch(applyMaintenanceFine({ id: bill.id, amount: bill.fineAmount + 500 })).unwrap()
      else await dispatch(updateMaintenanceStatus({ id: bill.id, status: "paid" })).unwrap()
      toast.success(action === "fine" ? "Late fine applied." : "Bill marked as paid.")
      setAction(null)
    } catch (error) { toast.error(typeof error === "string" ? error : "The bill could not be updated.") } finally { setLoading(false) }
  }
  return <><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setAction("fine")}><BadgeIndianRupee />Apply ₹500 fine</Button><Button size="sm" onClick={() => setAction("paid")}><CheckCheck />Mark paid</Button></div><ConfirmDialog open={action !== null} onOpenChange={(open) => !open && setAction(null)} title={action === "fine" ? "Apply late fine?" : "Mark this bill as paid?"} description={action === "fine" ? "A ₹500 late fee will be added to the total payable amount." : "This records the full amount as paid in the mock ledger."} confirmLabel={action === "fine" ? "Apply fine" : "Mark paid"} loading={loading} onConfirm={execute} /></>
}
