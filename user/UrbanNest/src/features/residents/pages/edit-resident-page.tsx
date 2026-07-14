import { useEffect, useMemo } from "react"
import { ArrowLeft, PencilLine } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { ResidentForm } from "@/features/residents/components/resident-form"
import type { ResidentFormValues } from "@/features/residents/schemas/resident.schema"
import {
  clearSelectedResident,
  fetchResidentDetails,
  updateResident,
} from "@/features/residents/store/residents.slice"
import type { ResidentDetails } from "@/features/residents/types/resident.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

function toFormValues(resident: ResidentDetails): ResidentFormValues {
  return {
    fullName: resident.fullName,
    email: resident.email,
    mobile: resident.mobile,
    dateOfBirth: resident.dateOfBirth ?? "",
    profileImageUrl: resident.profileImageUrl ?? "",
    towerId: resident.tower.id,
    flatNumber: resident.flat.number,
    floor: resident.flat.floor,
    ownershipType: resident.ownershipType,
    moveInDate: resident.moveInDate,
    emergencyContactName: resident.emergencyContact?.name ?? "",
    emergencyContactNumber: resident.emergencyContact?.mobile ?? "",
    emergencyContactRelationship: resident.emergencyContact?.relationship ?? "",
    familyMemberCount: resident.familyMemberCount,
    vehicleCount: resident.vehicleCount,
    notes: resident.notes,
  }
}

function ResidentFormSkeleton() {
  const fieldWidths = ["w-2/3", "w-1/2", "w-3/4", "w-2/5"] as const

  return (
    <div role="status" aria-label="Loading resident form" className="space-y-8" aria-live="polite">
      {["personal", "residence", "emergency", "additional"].map((section, sectionIndex) => (
        <section key={section} className="space-y-5 border-b border-border pb-8 last:border-b-0 last:pb-0">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: sectionIndex === 2 ? 3 : 4 }, (_, fieldIndex) => (
              <div key={`${section}-field-${fieldIndex}`} className="space-y-2">
                <div className={`h-3.5 animate-pulse rounded bg-muted motion-reduce:animate-none ${fieldWidths[fieldIndex % fieldWidths.length]}`} />
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </section>
      ))}
      <span className="sr-only">Loading resident information…</span>
    </div>
  )
}

export function EditResidentPage() {
  const { residentId } = useParams<{ residentId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { selectedResident, detailsLoading, mutationLoading, activeMutation, error } = useAppSelector(
    (state) => state.residents,
  )
  const isSubmitting = mutationLoading && activeMutation === "update"
  const resident = selectedResident?.id === residentId ? selectedResident : null
  const initialValues = useMemo(() => resident ? toFormValues(resident) : undefined, [resident])

  useEffect(() => {
    dispatch(clearSelectedResident())
    if (!residentId) return

    const request = dispatch(fetchResidentDetails(residentId))
    return () => {
      request.abort()
      dispatch(clearSelectedResident())
    }
  }, [dispatch, residentId])

  const handleRetry = async () => {
    if (!residentId) return
    dispatch(clearSelectedResident())
    await dispatch(fetchResidentDetails(residentId))
  }

  const handleSubmit = async (values: ResidentFormValues) => {
    if (!residentId) return

    try {
      const updatedResident = await dispatch(updateResident({ id: residentId, data: values })).unwrap()
      toast.success("Resident details updated successfully.")
      navigate(`${ROUTES.RESIDENTS}/${updatedResident.id}`, { replace: true })
    } catch {
      toast.error("The resident could not be updated. Please try again.")
    }
  }

  if (!residentId) {
    return (
      <ErrorState
        title="Resident ID is missing"
        description="Open a resident from the residents list and try again."
        backAction={<Button render={<Link to={ROUTES.RESIDENTS} />}>Back to residents</Button>}
      />
    )
  }

  const header = (
    <PageHeader
      title={resident ? `Edit ${resident.fullName}` : "Edit resident"}
      description="Update the resident's personal, residence, and emergency information."
      icon={<PencilLine className="size-5" />}
      breadcrumbs={
        <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={`${ROUTES.RESIDENTS}/${residentId}`}>
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Resident details
        </Link>
      }
    />
  )

  if (detailsLoading) {
    return (
      <div className="min-w-0 space-y-6">
        {header}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
            <div className="h-5 w-44 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </CardHeader>
          <CardContent className="px-4 pt-6 sm:px-6"><ResidentFormSkeleton /></CardContent>
        </Card>
      </div>
    )
  }

  if (!resident) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Resident unavailable"
          description={error ?? "This resident may no longer exist or you may not have access to edit it."}
          onRetry={handleRetry}
          backAction={<Button variant="outline" render={<Link to={ROUTES.RESIDENTS} />}>Back to residents</Button>}
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {header}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Resident details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Review the changes carefully before saving this profile.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <ResidentForm
            key={resident.id}
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
