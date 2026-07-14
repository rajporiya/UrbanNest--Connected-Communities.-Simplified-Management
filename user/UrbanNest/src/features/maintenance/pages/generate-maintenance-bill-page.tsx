import { ArrowLeft, ReceiptText } from "lucide-react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { MaintenanceBillForm } from "@/features/maintenance/components/maintenance-bill-form"
import { maintenanceResidents } from "@/features/maintenance/data/maintenance.mock"
import { maintenanceBillDefaultValues, type MaintenanceBillFormValues } from "@/features/maintenance/schemas/maintenance.schema"
import { generateMaintenanceBill, type MaintenanceState } from "@/features/maintenance/store/maintenance.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"

export function GenerateMaintenanceBillPage() {
  const dispatch = useAppDispatch(); const navigate = useNavigate()
  const loading = useSelector((state: { maintenance: MaintenanceState }) => state.maintenance.mutationLoading)
  const role = useSelector((state: { auth: { user: { role: string } | null } }) => state.auth.user?.role)
  if (role !== ROLES.COMMITTEE_HEAD && role !== ROLES.COMMITTEE_MEMBER) return <ErrorState title="Committee access required" description="Only authorized committee users can generate maintenance bills." />
  const submit = async (values: MaintenanceBillFormValues) => {
    const resident = maintenanceResidents.find((item) => item.id === values.residentId)
    if (!resident) { toast.error("Select a valid resident."); return }
    try {
      const bill = await dispatch(generateMaintenanceBill({ ...values, residentId: resident.id, residentName: resident.name, residentEmail: resident.email, towerId: resident.towerId, towerName: resident.towerName, flatNumber: resident.flatNumber })).unwrap()
      toast.success("Maintenance bill generated."); navigate(`${ROUTES.MAINTENANCE}/${bill.id}`, { replace: true })
    } catch (error) { toast.error(typeof error === "string" ? error : "Bill could not be generated.") }
  }
  return <div className="space-y-6"><PageHeader title="Generate maintenance bill" description="Create a transparent, itemized monthly bill for a resident." icon={<ReceiptText />} breadcrumbs={<Link className="inline-flex items-center gap-1" to={ROUTES.MAINTENANCE}><ArrowLeft className="size-4" />Maintenance bills</Link>} /><Card><CardContent className="pt-6"><MaintenanceBillForm initialValues={maintenanceBillDefaultValues} submitting={loading} onSubmit={submit} onCancel={() => navigate(-1)} /></CardContent></Card></div>
}
