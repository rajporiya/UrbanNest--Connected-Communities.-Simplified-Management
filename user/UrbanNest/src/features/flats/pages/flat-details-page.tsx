import { useEffect, type ReactNode } from "react"
import { Building2, DoorOpen, House, Layers3, Maximize2, UserRound } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { StatusBadge } from "@/components/common/status-badge"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes.constants"
import { FlatActions } from "@/features/flats/components/flat-actions"
import {
  clearSelectedFlat,
  fetchFlatDetails,
} from "@/features/flats/store/flats.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))

export function FlatDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { selectedFlat: flat, detailsLoading, error } = useAppSelector((state) => state.flats)

  useEffect(() => {
    dispatch(clearSelectedFlat())
    if (!id) return
    const request = dispatch(fetchFlatDetails(id))
    return () => {
      request.abort()
      dispatch(clearSelectedFlat())
    }
  }, [dispatch, id])

  const reload = () => {
    if (!id) return Promise.resolve()
    return dispatch(fetchFlatDetails(id)).unwrap().then(() => undefined)
  }

  if (detailsLoading) {
    return <LoadingState label="Loading flat details..." className="py-20" />
  }

  if (!id || error || !flat || flat.id !== id) {
    return (
      <ErrorState
        title="Flat not found"
        description={error ?? "The requested flat does not exist or is no longer available."}
        onRetry={id ? reload : undefined}
        backAction={<Button variant="outline" render={<Link to={ROUTES.FLATS} />}>Back to flats</Button>}
      />
    )
  }

  const overviewRows: ReadonlyArray<readonly [string, ReactNode]> = [
    ["Tower", flat.tower.name],
    ["Floor", flat.floorNumber === 0 ? "Ground floor" : `Floor ${flat.floorNumber}`],
    ["Flat number", flat.flatNumber],
    ["BHK type", flat.bhkType],
    ["Area", `${flat.areaSqFt.toLocaleString("en-IN")} sq ft`],
    ["Owner", flat.ownerName ?? "Not assigned"],
    ["Created", formatDate(flat.createdAt)],
    ["Last updated", formatDate(flat.updatedAt)],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={
          <AppBreadcrumb items={[{ label: "Flats", href: ROUTES.FLATS }, { label: flat.flatNumber }]} />
        }
        title={flat.flatNumber}
        description={`${flat.tower.name} · ${flat.floorNumber === 0 ? "Ground floor" : `Floor ${flat.floorNumber}`} · ${flat.bhkType}`}
        badge={<StatusBadge status={flat.occupancyStatus} />}
        icon={<House className="size-5" />}
        actions={
          <FlatActions
            flat={flat}
            onDeleted={() => navigate(ROUTES.FLATS, { replace: true })}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <ContentCard
          title="Flat overview"
          description="Location, configuration, and ownership information."
          icon={<DoorOpen className="size-5" />}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            {overviewRows.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg border border-border p-3">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </ContentCard>

        <div className="space-y-6">
          <ContentCard title="Occupancy" icon={<UserRound className="size-5" />} compact>
            <div className="space-y-4">
              <StatusBadge status={flat.occupancyStatus} />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Assigned owner</p>
                <p className="mt-1 text-sm font-semibold">{flat.ownerName ?? "No owner assigned"}</p>
              </div>
            </div>
          </ContentCard>
          <ContentCard title="Tower capacity" icon={<Building2 className="size-5" />} compact>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <Layers3 aria-hidden="true" className="mb-2 size-4 text-primary" />
                <p className="text-lg font-semibold">{flat.tower.totalFloors}</p>
                <p className="text-xs text-muted-foreground">Total floors</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <Maximize2 aria-hidden="true" className="mb-2 size-4 text-primary" />
                <p className="text-lg font-semibold">{flat.areaSqFt.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">Square feet</p>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  )
}
