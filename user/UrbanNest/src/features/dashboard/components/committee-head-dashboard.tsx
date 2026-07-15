import { useEffect, useState } from "react"
import { Plus, Search, ShieldCheck, Trash2, UserCheck, Users, UserX } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { ContentCard } from "@/components/common/content-card"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { ROUTES } from "@/constants/routes.constants"
import { demoteCommitteeMember, fetchCommitteeMembers } from "@/features/committee-members/store/committee-members.slice"
import { RoleDashboardContent } from "@/features/dashboard/components/role-dashboard-content"
import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"
import { fetchResidents, promoteResident, removeResident } from "@/features/residents/store/residents.slice"
import { fetchSecurityGuards, deleteSecurityGuard } from "@/features/security-guards/store/security-guards.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function CommitteeHeadDashboard({ data, loading }: { data: RoleDashboardResponse; loading?: boolean }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { residents, listLoading: residentsLoading } = useAppSelector((state) => state.residents)
  const { members: committeeMembers, listLoading: committeeLoading } = useAppSelector((state) => state.committeeMembers)
  const { securityGuards, listLoading: guardsLoading } = useAppSelector((state) => state.securityGuards)

  const [residentSearch, setResidentSearch] = useState("")
  const [committeeSearch, setCommitteeSearch] = useState("")
  const [guardSearch, setGuardSearch] = useState("")

  useEffect(() => {
    void dispatch(fetchResidents({ page: 1, limit: 100 }))
    void dispatch(fetchCommitteeMembers({ page: 1, limit: 100 }))
    void dispatch(fetchSecurityGuards({ page: 1, limit: 100 }))
  }, [dispatch])

  // Filter residents to show only active/approved residents with role "resident"
  const activeResidents = residents.filter(
    (r) =>
      r.role === "resident" &&
      r.approvalStatus === "approved" &&
      r.fullName.toLowerCase().includes(residentSearch.toLowerCase())
  )

  // Filter committee members by search
  const activeCommittee = committeeMembers.filter(
    (m) =>
      m.removedAt === null &&
      m.fullName.toLowerCase().includes(committeeSearch.toLowerCase())
  )

  // Filter guards by search
  const activeGuards = securityGuards.filter(
    (g) =>
      g.fullName.toLowerCase().includes(guardSearch.toLowerCase())
  )

  const handlePromote = async (id: string) => {
    try {
      await dispatch(promoteResident(id)).unwrap()
      toast.success("Resident successfully appointed to Committee")
      void dispatch(fetchResidents({ page: 1, limit: 100 }))
      void dispatch(fetchCommitteeMembers({ page: 1, limit: 100 }))
    } catch (err) {
      toast.error(String(err ?? "Failed to appoint member"))
    }
  }

  const handleDemote = async (id: string) => {
    try {
      await dispatch(demoteCommitteeMember(id)).unwrap()
      toast.success("Committee member demoted to normal resident")
      void dispatch(fetchResidents({ page: 1, limit: 100 }))
      void dispatch(fetchCommitteeMembers({ page: 1, limit: 100 }))
    } catch (err) {
      toast.error(String(err ?? "Failed to demote member"))
    }
  }

  const handleRemoveResident = async (id: string) => {
    try {
      await dispatch(removeResident(id)).unwrap()
      toast.success("Resident removed successfully")
      void dispatch(fetchResidents({ page: 1, limit: 100 }))
    } catch (err) {
      toast.error(String(err ?? "Failed to remove resident"))
    }
  }

  const handleRemoveGuard = async (id: string) => {
    try {
      await dispatch(deleteSecurityGuard(id)).unwrap()
      toast.success("Security guard removed successfully")
      void dispatch(fetchSecurityGuards({ page: 1, limit: 100 }))
    } catch (err) {
      toast.error(String(err ?? "Failed to remove security guard"))
    }
  }

  return (
    <div className="space-y-8">
      {/* Render the standard dashboard statistics and charts at the top */}
      <RoleDashboardContent data={data} role={ROLES.COMMITTEE_HEAD} loading={loading} />

      {/* Roster management section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Society & Roster Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            As Committee Head, you can appoint, delete, and add residents, committee members, and security guards.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          {/* Residents list */}
          <ContentCard
            title="Resident Directory"
            description="Manage and register society residents"
            icon={<Users className="size-5" />}
            headerAction={
              <Button
                type="button"
                size="xs"
                onClick={() => navigate(ROUTES.RESIDENT_NEW)}
                className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="size-3" /> Register Resident
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search residents..."
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="divide-y max-h-[400px] overflow-y-auto pr-1">
                {residentsLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading residents...</p>
                ) : activeResidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No residents found</p>
                ) : (
                  activeResidents.map((resident) => (
                    <div key={resident.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={resident.fullName} imageUrl={resident.profileImageUrl} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{resident.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{resident.tower.name} · Flat {resident.flat.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => handlePromote(resident.id)}
                          title="Appoint as Committee Member"
                          className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <UserCheck className="size-3" /> Appoint
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={() => handleRemoveResident(resident.id)}
                          title="Remove resident from system"
                          className="flex items-center gap-1 hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="size-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ContentCard>

          {/* Committee members list */}
          <ContentCard
            title="Active Committee Members"
            description="Manage active committee assignments"
            icon={<ShieldCheck className="size-5" />}
            headerAction={
              <Button
                type="button"
                size="xs"
                onClick={() => navigate(ROUTES.COMMITTEE_MEMBER_NEW)}
                className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="size-3" /> Add Member
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search committee..."
                  value={committeeSearch}
                  onChange={(e) => setCommitteeSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="divide-y max-h-[400px] overflow-y-auto pr-1">
                {committeeLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading roster...</p>
                ) : activeCommittee.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No committee members found</p>
                ) : (
                  activeCommittee.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={member.fullName} imageUrl={member.profileImageUrl} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.designation} ({member.department})</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDemote(member.id)}
                        className="flex items-center gap-1 hover:bg-destructive/20 transition-colors"
                      >
                        <UserX className="size-3" /> Demote
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ContentCard>

          {/* Security Guards list */}
          <ContentCard
            title="Security Guards"
            description="Manage and appoint security personnel"
            icon={<ShieldCheck className="size-5" />}
            headerAction={
              <Button
                type="button"
                size="xs"
                onClick={() => navigate(ROUTES.SECURITY_GUARD_NEW)}
                className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="size-3" /> Appoint Guard
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search guards..."
                  value={guardSearch}
                  onChange={(e) => setGuardSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="divide-y max-h-[400px] overflow-y-auto pr-1">
                {guardsLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading guards...</p>
                ) : activeGuards.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No guards appointed</p>
                ) : (
                  activeGuards.map((guard) => (
                    <div key={guard.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={guard.fullName} imageUrl={guard.profileImageUrl} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{guard.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">ID: {guard.employeeId} · Shift: {guard.shift.name} · {guard.gate}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleRemoveGuard(guard.id)}
                        className="flex items-center gap-1 hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="size-3" /> Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  )
}
