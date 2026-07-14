import { MessageSquarePlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { ContentCard } from "@/components/common/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { ROUTES } from "@/constants/routes.constants"
import { ComplaintForm } from "@/features/complaints/components/complaint-form"
import {
  complaintFormDefaultValues,
  type ComplaintFormValues,
} from "@/features/complaints/schemas/complaint.schema"
import { createComplaint } from "@/features/complaints/store/complaints.slice"
import type { ComplaintsState } from "@/features/complaints/store/complaints.slice"
import type { ComplaintImage } from "@/features/complaints/types/complaint.types"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  complaints: ComplaintsState
  auth: AuthState
}
export function CreateComplaintPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const mutating = useSelector((state: State) => state.complaints.mutating)
  const user = useSelector((state: State) => state.auth.user)
  const submit = async (
    values: ComplaintFormValues,
    images: ComplaintImage[]
  ) => {
    const complaint = await dispatch(
      createComplaint({
        input: { ...values, images },
        resident: {
          id: user?.id ?? "mock-resident",
          name: user ? `${user.firstName} ${user.lastName}` : "Resident",
          tower: "Tower A",
          flatNumber: "A-1204",
        },
      })
    ).unwrap()
    toast.success("Complaint raised successfully")
    navigate(`${ROUTES.COMPLAINTS}/${complaint.id}`)
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Raise complaint"
        description="Report a society issue and follow its progress."
        icon={<MessageSquarePlus className="size-5" />}
      />
      <ContentCard>
        <ComplaintForm
          initialValues={complaintFormDefaultValues}
          submitting={mutating}
          onSubmit={submit}
          onCancel={() => navigate(ROUTES.COMPLAINTS)}
        />
      </ContentCard>
    </div>
  )
}
