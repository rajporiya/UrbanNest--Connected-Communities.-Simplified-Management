import { ArrowLeft, UserRoundPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { ResidentForm } from "@/features/residents/components/resident-form"
import { residentFormDefaultValues, type ResidentFormValues } from "@/features/residents/schemas/resident.schema"
import { createResident } from "@/features/residents/store/residents.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function AddResidentPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSubmitting = useAppSelector(
    (state) => state.residents.mutationLoading && state.residents.activeMutation === "create",
  )

  const handleSubmit = async (values: ResidentFormValues) => {
    try {
      const resident = await dispatch(createResident(values)).unwrap()
      toast.success("Resident added successfully.")
      navigate(`${ROUTES.RESIDENTS}/${resident.id}`, { replace: true })
    } catch {
      toast.error("The resident could not be added. Please review the details and try again.")
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Add resident"
        description="Create a resident profile and assign their UrbanNest residence."
        icon={<UserRoundPlus className="size-5" />}
        breadcrumbs={
          <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={ROUTES.RESIDENTS}>
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Residents
          </Link>
        }
      />

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Resident details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Fields marked with an asterisk are required. You can update these details later.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <ResidentForm
            mode="create"
            initialValues={residentFormDefaultValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>

    </div>
  )
}
