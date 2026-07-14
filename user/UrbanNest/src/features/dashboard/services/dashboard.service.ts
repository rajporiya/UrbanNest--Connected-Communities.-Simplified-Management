import { dashboardByRole } from "@/features/dashboard/data/dashboard.mock"
import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"

const load = async (role: keyof typeof dashboardByRole): Promise<RoleDashboardResponse> => { await new Promise((resolve) => setTimeout(resolve, 350)); return dashboardByRole[role] }
export const dashboardService = {
  getCommitteeHeadDashboard: () => load("committee_head"), getCommitteeMemberDashboard: () => load("committee_member"), getResidentDashboard: () => load("resident"), getSecurityDashboard: () => load("security_guard"),
}
