import { useEffect } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"

import { ErrorState } from "@/components/feedback/error-state"
import { LoadingState } from "@/components/feedback/loading-state"
import { PageHeader } from "@/components/layout/page-header"
import { RoleBadge } from "@/components/common/role-badge"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { CommitteeHeadDashboard } from "@/features/dashboard/components/committee-head-dashboard"
import { CommitteeMemberDashboard } from "@/features/dashboard/components/committee-member-dashboard"
import { ResidentDashboard } from "@/features/dashboard/components/resident-dashboard"
import { SecurityDashboard } from "@/features/dashboard/components/security-dashboard"
import { fetchDashboard, refreshDashboard } from "@/features/dashboard/store/dashboard.slice"
import { getGreeting } from "@/features/dashboard/utils/get-greeting"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { data, loading, error } = useAppSelector((state) => state.dashboard)
  const role = user?.role
  useEffect(() => { if (role) void dispatch(fetchDashboard(role)) }, [dispatch, role])
  if (!user || !role) return <ErrorState title="User profile unavailable" description="Sign in again to load your dashboard." />
  const retry = () => { dispatch(refreshDashboard()); void dispatch(fetchDashboard(role)) }
  if (!data && loading) return <LoadingState label="Loading dashboard..." className="py-20" />
  if (!data && error) return <ErrorState title="Unable to load dashboard" description={error} onRetry={retry} />
  if (!data) return null
  const sections = { [ROLES.COMMITTEE_HEAD]: CommitteeHeadDashboard, [ROLES.COMMITTEE_MEMBER]: CommitteeMemberDashboard, [ROLES.RESIDENT]: ResidentDashboard, [ROLES.SECURITY_GUARD]: SecurityDashboard }
  const RoleDashboard = sections[role]
  const currentDate = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())
  return <div className="space-y-7"><PageHeader title={`${getGreeting()}, ${user.firstName}`} description={`Here is what is happening in UrbanNest today. ${currentDate}`} badge={<RoleBadge role={role} />} actions={<Button type="button" variant="outline" disabled={loading} onClick={retry} aria-label="Refresh dashboard data">{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <RefreshCw aria-hidden="true" />}Refresh</Button>} />{error ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">Refresh failed. Existing dashboard data is still shown.</div> : null}<RoleDashboard data={data} loading={false} /></div>
}
