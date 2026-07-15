import { ArrowLeft, Building2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { TowerForm } from "@/features/towers/components/tower-form"
import {
  towerFormDefaultValues,
  type TowerFormValues,
} from "@/features/towers/schemas/tower.schema"
import { createTower } from "@/features/towers/store/towers.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function AddTowerPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSubmitting = useAppSelector(
    (state) =>
      state.towers.mutationLoading && state.towers.activeMutation === "create",
  )

  const handleSubmit = async (values: TowerFormValues) => {
    try {
      const tower = await dispatch(createTower(values)).unwrap()
      toast.success("Tower added successfully.")
      navigate(`${ROUTES.TOWERS}/${tower.id}`, { replace: true })
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "The tower could not be added. Please review the details and try again.",
      )
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Add tower"
        description="Create a tower record and define its residential capacity."
        icon={<Building2 className="size-5" />}
        breadcrumbs={
          <Link
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            to={ROUTES.TOWERS}
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Towers
          </Link>
        }
      />

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Tower details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Fields marked with an asterisk are required. Capacity can be updated
            later.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <TowerForm
            mode="create"
            initialValues={towerFormDefaultValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
