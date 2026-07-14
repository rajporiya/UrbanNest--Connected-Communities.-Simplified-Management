import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"
import { ROLES } from "@/constants/roles.constants"
import { RoleDashboardContent } from "./role-dashboard-content"
export function CommitteeMemberDashboard({ data, loading }: { data: RoleDashboardResponse; loading?: boolean }) { return <RoleDashboardContent data={data} role={ROLES.COMMITTEE_MEMBER} loading={loading} /> }
