import { ArrowLeft, ShieldPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { SecurityGuardForm } from "@/features/security-guards/components/security-guard-form"
import {
  securityGuardFormDefaultValues,
  type SecurityGuardFormValues,
} from "@/features/security-guards/schemas/security-guard.schema"
import { createSecurityGuard } from "@/features/security-guards/store/security-guards.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function AddSecurityGuardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSubmitting = useAppSelector(
    (state) =>
      state.securityGuards.mutationLoading && state.securityGuards.activeMutation === "create",
  )

  const handleSubmit = async (values: SecurityGuardFormValues) => {
    try {
      const guard = await dispatch(createSecurityGuard(values)).unwrap()
      toast.success("Security guard added successfully.")
      navigate(`${ROUTES.SECURITY_GUARDS}/${guard.id}`, { replace: true })
    } catch {
      toast.error("The security guard could not be added. Review the details and try again.")
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Add security guard"
        description="Create a guard profile and assign a gate and working shift."
        icon={<ShieldPlus className="size-5" />}
        breadcrumbs={
          <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={ROUTES.SECURITY_GUARDS}>
            <ArrowLeft aria-hidden="true" className="size-3.5" />Security guards
          </Link>
        }
      />
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Guard details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Fields marked with an asterisk are required. Gate and shift assignments can be changed later.
          </p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <SecurityGuardForm
            mode="create"
            initialValues={securityGuardFormDefaultValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
