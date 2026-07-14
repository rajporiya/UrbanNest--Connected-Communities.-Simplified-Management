import { useEffect, useMemo } from "react"
import { ArrowLeft, PencilLine } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { TowerForm } from "@/features/towers/components/tower-form"
import type { TowerFormValues } from "@/features/towers/schemas/tower.schema"
import {
  clearSelectedTower,
  fetchTowerDetails,
  updateTower,
} from "@/features/towers/store/towers.slice"
import type { TowerDetails } from "@/features/towers/types/tower.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

function toFormValues(tower: TowerDetails): TowerFormValues {
  return {
    name: tower.name,
    numberOfFloors: tower.numberOfFloors,
    totalFlats: tower.totalFlats,
    description: tower.description,
    status: tower.status,
  }
}

export function EditTowerPage() {
  const params = useParams<{ towerId?: string; id?: string }>()
  const towerId = params.towerId ?? params.id
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    selectedTower,
    detailsLoading,
    mutationLoading,
    activeMutation,
    error,
  } = useAppSelector((state) => state.towers)
  const isSubmitting = mutationLoading && activeMutation === "update"
  const tower = selectedTower?.id === towerId ? selectedTower : null
  const initialValues = useMemo(
    () => (tower ? toFormValues(tower) : undefined),
    [tower],
  )

  useEffect(() => {
    dispatch(clearSelectedTower())
    if (!towerId) return

    const request = dispatch(fetchTowerDetails(towerId))
    return () => {
      request.abort()
      dispatch(clearSelectedTower())
    }
  }, [dispatch, towerId])

  const handleSubmit = async (values: TowerFormValues) => {
    if (!towerId) return

    try {
      const updatedTower = await dispatch(
        updateTower({ id: towerId, data: values }),
      ).unwrap()
      toast.success("Tower updated successfully.")
      navigate(`${ROUTES.TOWERS}/${updatedTower.id}`, { replace: true })
    } catch (submitError) {
      toast.error(
        typeof submitError === "string"
          ? submitError
          : "The tower could not be updated. Please try again.",
      )
    }
  }

  const handleRetry = async () => {
    if (!towerId) return
    dispatch(clearSelectedTower())
    await dispatch(fetchTowerDetails(towerId))
  }

  if (!towerId) {
    return (
      <ErrorState
        title="Tower ID is missing"
        description="Open a tower from the list and try again."
        backAction={
          <Button render={<Link to={ROUTES.TOWERS} />}>Back to towers</Button>
        }
      />
    )
  }

  const header = (
    <PageHeader
      title={tower ? `Edit ${tower.name}` : "Edit tower"}
      description="Update the tower's capacity, description, or status."
      icon={<PencilLine className="size-5" />}
      breadcrumbs={
        <Link
          className="inline-flex items-center gap-1.5 hover:text-foreground"
          to={`${ROUTES.TOWERS}/${towerId}`}
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Tower details
        </Link>
      }
    />
  )

  if (detailsLoading) {
    return (
      <div className="min-w-0 space-y-6">
        {header}
        <LoadingState label="Loading tower form..." className="py-20" />
      </div>
    )
  }

  if (!tower || !initialValues) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Tower unavailable"
          description={
            error ??
            "This tower may no longer exist or you may not have access to edit it."
          }
          onRetry={handleRetry}
          backAction={
            <Button variant="outline" render={<Link to={ROUTES.TOWERS} />}>
              Back to towers
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {header}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Tower details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Review all capacity and status changes before saving.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <TowerForm
            key={tower.id}
            mode="edit"
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
