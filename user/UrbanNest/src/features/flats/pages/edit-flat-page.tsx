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
import { FlatForm } from "@/features/flats/components/flat-form"
import type { FlatFormValues } from "@/features/flats/schemas/flat.schema"
import {
  clearSelectedFlat,
  fetchFlatDetails,
  updateFlat,
} from "@/features/flats/store/flats.slice"
import type { FlatDetails } from "@/features/flats/types/flat.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

function toFormValues(flat: FlatDetails): FlatFormValues {
  return {
    towerId: flat.tower.id,
    floorNumber: flat.floorNumber,
    flatNumber: flat.flatNumber,
    bhkType: flat.bhkType,
    areaSqFt: flat.areaSqFt,
    ownerName: flat.ownerName ?? "",
    occupancyStatus: flat.occupancyStatus,
  }
}

export function EditFlatPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { selectedFlat, detailsLoading, mutationLoading, activeMutation, error } =
    useAppSelector((state) => state.flats)
  const flat = selectedFlat?.id === id ? selectedFlat : null
  const initialValues = useMemo(() => flat ? toFormValues(flat) : undefined, [flat])
  const isSubmitting = mutationLoading && activeMutation === "update"

  useEffect(() => {
    dispatch(clearSelectedFlat())
    if (!id) return
    const request = dispatch(fetchFlatDetails(id))
    return () => {
      request.abort()
      dispatch(clearSelectedFlat())
    }
  }, [dispatch, id])

  const retry = () => {
    if (!id) return Promise.resolve()
    return dispatch(fetchFlatDetails(id)).unwrap().then(() => undefined)
  }

  const handleSubmit = async (values: FlatFormValues) => {
    if (!id) return
    try {
      const updated = await dispatch(updateFlat({ id, data: values })).unwrap()
      toast.success(`Flat ${updated.flatNumber} updated successfully.`)
      navigate(`${ROUTES.FLATS}/${updated.id}`, { replace: true })
    } catch (submitError) {
      toast.error(typeof submitError === "string" ? submitError : "The flat could not be updated. Please try again.")
    }
  }

  const header = (
    <PageHeader
      title={flat ? `Edit ${flat.flatNumber}` : "Edit flat"}
      description="Update the flat's location, configuration, owner, and occupancy."
      icon={<PencilLine className="size-5" />}
      breadcrumbs={
        <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={id ? `${ROUTES.FLATS}/${id}` : ROUTES.FLATS}>
          <ArrowLeft aria-hidden="true" className="size-3.5" />Flat details
        </Link>
      }
    />
  )

  if (!id) {
    return (
      <ErrorState
        title="Flat ID is missing"
        description="Open a flat from the flat list and try again."
        backAction={<Button render={<Link to={ROUTES.FLATS} />}>Back to flats</Button>}
      />
    )
  }

  if (detailsLoading) {
    return <div className="space-y-6">{header}<LoadingState label="Loading flat form..." className="py-20" /></div>
  }

  if (!flat || !initialValues) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Flat unavailable"
          description={error ?? "This flat may no longer exist or you may not have access to edit it."}
          onRetry={retry}
          backAction={<Button variant="outline" render={<Link to={ROUTES.FLATS} />}>Back to flats</Button>}
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {header}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Flat details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Review the tower and occupancy carefully before saving.</p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <FlatForm
            key={flat.id}
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
