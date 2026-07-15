import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { PageHeader } from "@/components/layout/page-header"
import { ContentCard } from "@/components/common/content-card"
import { UserPlus } from "lucide-react"
import { ROUTES } from "@/constants/routes.constants"
import { VisitorPassForm } from "@/features/visitors/components/visitor-pass-form"
import {
  visitorPassDefaultValues,
  type VisitorPassFormValues,
} from "@/features/visitors/schemas/visitor.schema"
import { createVisitorPass } from "@/features/visitors/store/visitors.slice"
import type { VisitorsState } from "@/features/visitors/store/visitors.slice"
import type { AuthState } from "@/features/auth/store/auth.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
interface State {
  visitors: VisitorsState
  auth: AuthState
}
export function CreateVisitorPassPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const mutating = useSelector((state: State) => state.visitors.mutating)
  const user = useSelector((state: State) => state.auth.user)
  const submit = async (values: VisitorPassFormValues) => {
    const pass = await dispatch(
      createVisitorPass({
        input: values,
        resident: {
          id: user?.id ?? "mock-resident",
          name: user ? `${user.firstName} ${user.lastName}` : "Resident",
          tower: "Tower A",
          flatNumber: "A-1204",
        },
      })
    ).unwrap()
    toast.success("Visitor pass created")
    navigate(`${ROUTES.VISITORS}/${pass.id}`)
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create visitor pass"
        description="Share the generated QR code with your expected visitor."
        icon={<UserPlus className="size-5" />}
      />
      <ContentCard>
        <VisitorPassForm
          initialValues={visitorPassDefaultValues}
          submitting={mutating}
          onSubmit={submit}
          onCancel={() => navigate(ROUTES.VISITORS)}
        />
      </ContentCard>
    </div>
  )
}
