import { useEffect, useMemo } from "react"
import { ArrowLeft, PencilLine } from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { ErrorState } from "@/components/feedback/error-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { SecurityGuardForm } from "@/features/security-guards/components/security-guard-form"
import type { SecurityGuardFormValues } from "@/features/security-guards/schemas/security-guard.schema"
import {
  clearSelectedSecurityGuard,
  fetchSecurityGuardDetails,
  updateSecurityGuard,
} from "@/features/security-guards/store/security-guards.slice"
import type { SecurityGuardDetails } from "@/features/security-guards/types/security-guard.types"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

function toFormValues(guard: SecurityGuardDetails): SecurityGuardFormValues {
  return {
    fullName: guard.fullName,
    email: guard.email,
    mobile: guard.mobile,
    employeeId: guard.employeeId,
    profileImageUrl: guard.profileImageUrl ?? "",
    gate: guard.gate,
    shiftName: guard.shift.name,
    shiftStartTime: guard.shift.startTime,
    shiftEndTime: guard.shift.endTime,
    joiningDate: guard.joiningDate,
    emergencyContactName: guard.emergencyContact.name,
    emergencyContactNumber: guard.emergencyContact.mobile,
    emergencyContactRelationship: guard.emergencyContact.relationship,
    status: guard.status,
  }
}

function GuardFormSkeleton() {
  return (
    <div role="status" aria-label="Loading security guard form" className="space-y-8" aria-live="polite">
      {[4, 6, 3].map((fieldCount, sectionIndex) => (
        <section key={fieldCount} className="space-y-5 border-b border-border pb-8 last:border-b-0 last:pb-0">
          <div className="space-y-2">
            <div className="h-5 w-44 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: fieldCount }, (_, index) => (
              <div key={`${sectionIndex}-${index}`} className="space-y-2">
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </section>
      ))}
      <span className="sr-only">Loading security guard information…</span>
    </div>
  )
}

export function EditSecurityGuardPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { selectedSecurityGuard, detailsLoading, mutationLoading, activeMutation, error } =
    useAppSelector((state) => state.securityGuards)
  const guard = selectedSecurityGuard?.id === id ? selectedSecurityGuard : null
  const initialValues = useMemo(() => guard ? toFormValues(guard) : undefined, [guard])
  const isSubmitting = mutationLoading && activeMutation === "update"

  useEffect(() => {
    dispatch(clearSelectedSecurityGuard())
    if (!id) return
    const request = dispatch(fetchSecurityGuardDetails(id))
    return () => {
      request.abort()
      dispatch(clearSelectedSecurityGuard())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!guard) return
    const focusTarget = searchParams.get("focus")
    const elementId = focusTarget === "gate" ? "guard-gate" : focusTarget === "shift" ? "guard-shift" : null
    if (!elementId) return
    const frame = globalThis.requestAnimationFrame(() => {
      const element = document.getElementById(elementId)
      element?.scrollIntoView({ behavior: "smooth", block: "center" })
      element?.focus()
    })
    return () => globalThis.cancelAnimationFrame(frame)
  }, [guard, searchParams])

  const retry = () => {
    if (!id) return Promise.resolve()
    return dispatch(fetchSecurityGuardDetails(id)).unwrap().then(() => undefined)
  }

  const handleSubmit = async (values: SecurityGuardFormValues) => {
    if (!id) return
    try {
      const updatedGuard = await dispatch(updateSecurityGuard({ id, data: values })).unwrap()
      toast.success("Security guard details updated successfully.")
      navigate(`${ROUTES.SECURITY_GUARDS}/${updatedGuard.id}`, { replace: true })
    } catch {
      toast.error("The security guard could not be updated. Please try again.")
    }
  }

  if (!id) {
    return (
      <ErrorState
        title="Security guard ID is missing"
        description="Open a guard from the security guard list and try again."
        backAction={<Button render={<Link to={ROUTES.SECURITY_GUARDS} />}>Back to security guards</Button>}
      />
    )
  }

  const header = (
    <PageHeader
      title={guard ? `Edit ${guard.fullName}` : "Edit security guard"}
      description="Update identity, gate, shift, emergency contact, and account status."
      icon={<PencilLine className="size-5" />}
      breadcrumbs={
        <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={`${ROUTES.SECURITY_GUARDS}/${id}`}>
          <ArrowLeft aria-hidden="true" className="size-3.5" />Guard details
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
          <CardContent className="px-4 pt-6 sm:px-6"><GuardFormSkeleton /></CardContent>
        </Card>
      </div>
    )
  }

  if (!guard || !initialValues) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="Security guard unavailable"
          description={error ?? "This guard may no longer exist or you may not have access to edit it."}
          onRetry={retry}
          backAction={<Button variant="outline" render={<Link to={ROUTES.SECURITY_GUARDS} />}>Back to security guards</Button>}
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {header}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Guard details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Review gate and shift assignments carefully before saving.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <SecurityGuardForm
            key={guard.id}
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
