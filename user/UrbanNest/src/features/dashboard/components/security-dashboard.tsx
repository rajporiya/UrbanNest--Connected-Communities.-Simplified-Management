import { useEffect } from "react"
import { Eye, QrCode } from "lucide-react"
import { Link } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { QrPreview } from "@/features/visitors/components/qr-preview"
import {
  fetchVisitors,
  type VisitorsState,
} from "@/features/visitors/store/visitors.slice"
import { ROUTES } from "@/constants/routes.constants"
import { Button } from "@/components/ui/button"
import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"
import { ROLES } from "@/constants/roles.constants"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import { RoleDashboardContent } from "./role-dashboard-content"

export function SecurityDashboard({
  data,
  loading,
}: {
  data: RoleDashboardResponse
  loading?: boolean
}) {
  const dispatch = useAppDispatch()
  const { items, loading: visitorsLoading } = useAppSelector(
    (state: { visitors: VisitorsState }) => state.visitors
  )

  useEffect(() => {
    void dispatch(fetchVisitors({ status: "expected", sort: "visit_asc", limit: 4 }))
  }, [dispatch])

  return (
    <div className="space-y-6">
      <RoleDashboardContent data={data} role={ROLES.SECURITY_GUARD} loading={loading} />
      <ContentCard
        title="Expected visitor QR codes"
        description="Resident-generated passes awaiting verification at the gate."
        headerAction={
          <Button variant="outline" size="sm" render={<Link to={ROUTES.VISITORS_TODAY} />}>
            <Eye />
            View all
          </Button>
        }
      >
        {visitorsLoading ? (
          <p className="text-sm text-muted-foreground">Loading visitor passes…</p>
        ) : items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((pass) => (
              <QrPreview
                key={pass.id}
                value={pass.qrCode}
                label={`${pass.visitorName} · ${pass.tower} ${pass.flatNumber}`}
                className="gap-3 p-3"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <QrCode className="size-5" />
            No resident-generated visitor QR codes are awaiting verification.
          </div>
        )}
      </ContentCard>
    </div>
  )
}
