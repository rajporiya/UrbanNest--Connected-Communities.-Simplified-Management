import { useEffect, useState } from "react"
import { Search, ShieldCheck, UserCheck, Users, UserX } from "lucide-react"
import { toast } from "sonner"

import { ContentCard } from "@/components/common/content-card"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/constants/roles.constants"
import { demoteCommitteeMember, fetchCommitteeMembers } from "@/features/committee-members/store/committee-members.slice"
import { RoleDashboardContent } from "@/features/dashboard/components/role-dashboard-content"
import type { RoleDashboardResponse } from "@/features/dashboard/types/dashboard.types"
import { fetchResidents, promoteResident } from "@/features/residents/store/residents.slice"
import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"

export function CommitteeHeadDashboard({ data, loading }: { data: RoleDashboardResponse; loading?: boolean }) {
  const dispatch = useAppDispatch()

  const { residents, listLoading: residentsLoading } = useAppSelector((state) => state.residents)
  const { members: committeeMembers, listLoading: committeeLoading } = useAppSelector((state) => state.committeeMembers)

  const [residentSearch, setResidentSearch] = useState("")
  const [committeeSearch, setCommitteeSearch] = useState("")

  useEffect(() => {
    void dispatch(fetchResidents({ page: 1, limit: 100 }))
    void dispatch(fetchCommitteeMembers({ page: 1, limit: 100 }))
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

  return (
    <div className="space-y-8">
      {/* Render the standard dashboard statistics and charts at the top */}
      <RoleDashboardContent data={data} role={ROLES.COMMITTEE_HEAD} loading={loading} />

      {/* Roster management section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Committee & Resident Roster Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            As Committee Head, you can appoint approved residents to the committee or demote active members back to residents.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Residents list */}
          <ContentCard
            title="Resident Directory"
            description="Approve new committee appointments from here"
            icon={<Users className="size-5" />}
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
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handlePromote(resident.id)}
                        className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <UserCheck className="size-3" /> Appoint
                      </Button>
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
        </div>
      </div>
    </div>
  )
}
