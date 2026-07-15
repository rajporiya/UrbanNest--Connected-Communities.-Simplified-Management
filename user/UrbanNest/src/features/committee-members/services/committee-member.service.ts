import { api } from "@/services/api-client"
import type {
  CommitteeMemberDetails,
  CommitteeMemberListQuery,
  CommitteeMemberListResponse,
  CreateCommitteeMemberRequest,
  UpdateCommitteeMemberRequest,
} from "@/features/committee-members/types/committee-member.types"
import type { ResidentDetails } from "@/features/residents/types/resident.types"

function mapBackendCommitteeMemberToFrontend(m: any): CommitteeMemberDetails {
  return {
    id: m._id,
    role: "committee_member",
    fullName: `${m.userId.firstName} ${m.userId.lastName}`.trim(),
    email: m.userId.email,
    mobile: m.userId.phone,
    profileImageUrl: m.userId.profileImage?.secure_url || null,
    department: m.department,
    designation: m.designation,
    responsibilities: m.responsibilities || [],
    joinedDate: m.joiningDate ? m.joiningDate.split("T")[0] : "",
    status: m.status === "Active" ? "active" : "inactive",
    removedAt: m.isDeleted ? m.updatedAt : null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    assignedComplaints: [],
    assignedBookings: [],
    activityLog: [],
  }
}

export interface CommitteeMemberService {
  getCommitteeMembers(
    query?: CommitteeMemberListQuery,
  ): Promise<CommitteeMemberListResponse>
  getCommitteeMemberById(id: string): Promise<CommitteeMemberDetails>
  createCommitteeMember(
    data: CreateCommitteeMemberRequest,
  ): Promise<CommitteeMemberDetails>
  updateCommitteeMember(
    id: string,
    data: UpdateCommitteeMemberRequest,
  ): Promise<CommitteeMemberDetails>
  deleteCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  activateCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  deactivateCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  demoteCommitteeMemberRole(id: string): Promise<CommitteeMemberDetails>
  promoteCommitteeMemberByResident(resident: ResidentDetails): Promise<void>
}

export const committeeMemberService: CommitteeMemberService = {
  async getCommitteeMembers(query = {}) {
    const params: any = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      department: query.department,
      status: query.status === "active" ? "Active" : query.status === "inactive" ? "Inactive" : undefined,
    }

    const res = await api.get<{ members: any[]; pagination: any }>("/committee-members", { params })
    return {
      items: res.data.members.map(mapBackendCommitteeMemberToFrontend),
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }
  },

  async getCommitteeMemberById(id) {
    const res = await api.get<{ member: any }>(`/committee-members/${id}`)
    return mapBackendCommitteeMemberToFrontend(res.data.member)
  },

  async createCommitteeMember(data) {
    const names = data.fullName.trim().split(/\s+/)
    const firstName = names.shift() || data.fullName.trim()
    const lastName = names.join(" ") || "Member"

    let userId = ""
    try {
      const usersRes = await api.get<{ users: any[] }>(`/users?search=${data.email}`)
      const existing = usersRes.data.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())
      if (existing) {
        userId = existing.id
      }
    } catch {
      // ignore
    }

    if (!userId) {
      const userRes = await api.post<{ user: any }>("/users", {
        firstName,
        lastName,
        email: data.email,
        phone: data.mobile,
        role: "Committee Member",
      })
      userId = userRes.data.user.id
    }

    const memberRes = await api.post<{ member: any }>("/committee-members", {
      userId,
      department: data.department,
      designation: data.designation,
      joiningDate: data.joinedDate,
      responsibilities: data.responsibilities,
      permissions: [],
      status: data.status === "active" ? "Active" : "Inactive",
    })
    return mapBackendCommitteeMemberToFrontend(memberRes.data.member)
  },

  async updateCommitteeMember(id, data) {
    const updatePayload: any = {}
    if (data.department) updatePayload.department = data.department
    if (data.designation) updatePayload.designation = data.designation
    if (data.joinedDate) updatePayload.joiningDate = data.joinedDate
    if (data.responsibilities) updatePayload.responsibilities = data.responsibilities
    if (data.status) updatePayload.status = data.status === "active" ? "Active" : "Inactive"

    const res = await api.put<{ member: any }>(`/committee-members/${id}`, updatePayload)
    return mapBackendCommitteeMemberToFrontend(res.data.member)
  },

  async deleteCommitteeMember(id) {
    const details = await this.getCommitteeMemberById(id)
    await api.delete(`/committee-members/${id}`)
    return details
  },

  async activateCommitteeMember(id) {
    const res = await api.patch<{ member: any }>(`/committee-members/${id}/status`, { status: "Active" })
    return mapBackendCommitteeMemberToFrontend(res.data.member)
  },

  async deactivateCommitteeMember(id) {
    const res = await api.patch<{ member: any }>(`/committee-members/${id}/status`, { status: "Inactive" })
    return mapBackendCommitteeMemberToFrontend(res.data.member)
  },

  async demoteCommitteeMemberRole(id) {
    const details = await this.getCommitteeMemberById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (!user) throw new Error("User not found")

    await api.put(`/users/${user.id}`, { role: "Resident" })

    await api.delete(`/committee-members/${id}`)

    const towersRes = await api.get<{ towers: any[] }>("/towers?limit=100")
    const dbTowers = towersRes.data.towers
    let dbTower = dbTowers.find((t: any) => t.towerName.toLowerCase() === (user.tower || "TOWER A").toLowerCase())
    if (!dbTower) dbTower = dbTowers[0]

    const flatsRes = await api.get<{ flats: any[] }>(`/flats?towerId=${dbTower._id}&limit=100`)
    let dbFlat = flatsRes.data.flats.find((f: any) => f.flatNumber.toLowerCase() === (user.flat || "A-101").toLowerCase())
    if (!dbFlat) dbFlat = flatsRes.data.flats[0]

    const now = new Date().toISOString()
    await api.post("/residents", {
      userId: user.id,
      towerId: dbTower._id,
      flatId: dbFlat._id,
      ownershipType: "Owner",
      moveInDate: now.split("T")[0],
      emergencyContact: details.mobile,
      bloodGroup: null,
      occupation: "",
      status: "Active",
    })

    return {
      ...details,
      role: "resident" as any,
    }
  },

  async promoteCommitteeMemberByResident(resident) {
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${resident.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === resident.email.toLowerCase())
    if (!user) return

    await api.put(`/users/${user.id}`, { role: "Committee Member" })

    const now = new Date().toISOString().split("T")[0]
    await api.post("/committee-members", {
      userId: user.id,
      department: "Administration",
      designation: "Committee Member",
      joiningDate: now,
      responsibilities: ["Manage Residents"],
      permissions: [],
      status: "Active",
    })
  },
}
