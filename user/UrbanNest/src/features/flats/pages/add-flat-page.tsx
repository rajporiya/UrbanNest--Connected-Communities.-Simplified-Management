import { ArrowLeft, HousePlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes.constants"
import { FlatForm } from "@/features/flats/components/flat-form"
import {
  flatFormDefaultValues,
  type FlatFormValues,
} from "@/features/flats/schemas/flat.schema"
import { createFlat } from "@/features/flats/store/flats.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function AddFlatPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSubmitting = useAppSelector(
    (state) => state.flats.mutationLoading && state.flats.activeMutation === "create",
  )

  const handleSubmit = async (values: FlatFormValues) => {
    try {
      const flat = await dispatch(createFlat(values)).unwrap()
      toast.success(`Flat ${flat.flatNumber} added successfully.`)
      navigate(`${ROUTES.FLATS}/${flat.id}`, { replace: true })
    } catch (error) {
      toast.error(typeof error === "string" ? error : "The flat could not be added. Please try again.")
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Add flat"
        description="Add a flat and record its location, size, owner, and occupancy."
        icon={<HousePlus className="size-5" />}
        breadcrumbs={
          <Link className="inline-flex items-center gap-1.5 hover:text-foreground" to={ROUTES.FLATS}>
            <ArrowLeft aria-hidden="true" className="size-3.5" />Flats
          </Link>
        }
      />
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle>Flat details</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Fields marked with an asterisk are required.</p>
        </CardHeader>
        <CardContent className="px-4 pt-6 sm:px-6">
          <FlatForm
            mode="create"
            initialValues={flatFormDefaultValues}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
