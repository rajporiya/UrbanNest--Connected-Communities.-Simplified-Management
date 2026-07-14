import { useEffect } from "react"
import {
  Building2,
  CalendarDays,
  FileText,
  House,
  Layers3,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { StatusBadge } from "@/components/common/status-badge"
import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ROUTES } from "@/constants/routes.constants"
import { TowerActions } from "@/features/towers/components/tower-actions"
import {
  clearSelectedTower,
  fetchTowerDetails,
} from "@/features/towers/store/towers.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

export function TowerDetailsPage() {
  const params = useParams<{ towerId?: string; id?: string }>()
  const towerId = params.towerId ?? params.id
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { selectedTower, detailsLoading, error } = useAppSelector(
    (state) => state.towers,
  )
  const tower = selectedTower?.id === towerId ? selectedTower : null

  useEffect(() => {
    dispatch(clearSelectedTower())
    if (!towerId) return

    const request = dispatch(fetchTowerDetails(towerId))
    return () => {
      request.abort()
      dispatch(clearSelectedTower())
    }
  }, [dispatch, towerId])

  if (detailsLoading) {
    return <LoadingState label="Loading tower details..." className="py-20" />
  }

  if (!towerId || error || !tower) {
    return (
      <ErrorState
        title="Tower not found"
        description={
          error ?? "The requested tower does not exist or is no longer available."
        }
        onRetry={
          towerId
            ? () =>
                dispatch(fetchTowerDetails(towerId))
                  .unwrap()
                  .then(() => undefined)
            : undefined
        }
        backAction={
          <Button variant="outline" render={<Link to={ROUTES.TOWERS} />}>
            Back to towers
          </Button>
        }
      />
    )
  }

  const averageFlatsPerFloor = tower.totalFlats / tower.numberOfFloors

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={
          <AppBreadcrumb
            items={[
              { label: "Towers", href: ROUTES.TOWERS },
              { label: tower.name },
            ]}
          />
        }
        title={tower.name}
        description="Tower capacity, status, and management information."
        badge={<StatusBadge status={tower.status} />}
        icon={<Building2 className="size-5" />}
        actions={
          <TowerActions
            tower={tower}
            onDeleted={() => navigate(ROUTES.TOWERS, { replace: true })}
          />
        }
      />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ContentCard compact title="Number of floors" icon={<Layers3 className="size-5" />}>
          <p className="text-3xl font-semibold tracking-tight">
            {tower.numberOfFloors.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Residential floors</p>
        </ContentCard>
        <ContentCard compact title="Total flats" icon={<House className="size-5" />}>
          <p className="text-3xl font-semibold tracking-tight">
            {tower.totalFlats.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Configured units</p>
        </ContentCard>
        <ContentCard compact title="Average density" icon={<Building2 className="size-5" />}>
          <p className="text-3xl font-semibold tracking-tight">
            {averageFlatsPerFloor.toLocaleString("en-IN", {
              maximumFractionDigits: 1,
            })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Flats per floor</p>
        </ContentCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <ContentCard title="About this tower" icon={<FileText className="size-5" />}>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {tower.description || "No description has been added for this tower."}
          </p>
        </ContentCard>

        <ContentCard title="Record information" icon={<CalendarDays className="size-5" />}>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDateTime(tower.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last updated
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDateTime(tower.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tower ID
              </dt>
              <dd className="mt-1 break-all font-mono text-xs">{tower.id}</dd>
            </div>
          </dl>
        </ContentCard>
      </div>
    </div>
  )
}
