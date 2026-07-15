import { api } from "@/services/api-client"
import type {
  CreateResidentRequest,
  ResidentDetails,
  ResidentListQuery,
  ResidentListResponse,
  UpdateResidentRequest,
  OwnershipType,
} from "@/features/residents/types/resident.types"

function mapBackendResidentToFrontend(res: any): ResidentDetails {
  return {
    id: res._id,
    role: "resident",
    fullName: `${res.userId.firstName} ${res.userId.lastName}`.trim(),
    email: res.userId.email,
    mobile: res.userId.phone,
    dateOfBirth: res.userId.dateOfBirth || null,
    profileImageUrl: res.userId.profileImage?.secure_url || null,
    tower: {
      id: res.towerId?._id || "",
      name: res.towerId?.towerName || "",
    },
    flat: {
      id: res.flatId?._id || "",
      towerId: res.towerId?._id || "",
      number: res.flatId?.flatNumber || "",
      floor: res.flatId?.floorNumber || 0,
    },
    ownershipType: (res.ownershipType?.toLowerCase() || "owner") as OwnershipType,
    approvalStatus: res.status === "Active" ? "approved" : "pending",
    accountStatus: res.userId.isActive ? "active" : "inactive",
    moveInDate: res.moveInDate ? res.moveInDate.split("T")[0] : "",
    emergencyContact: res.emergencyContact ? {
      name: "Emergency",
      mobile: res.emergencyContact,
      relationship: "Contact",
    } : null,
    familyMemberCount: res.familyMemberCount || 0,
    vehicleCount: 0,
    notes: res.notes || "",
    joinedAt: res.createdAt,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    familyMembers: [],
    vehicles: [],
    maintenance: {
      outstandingAmount: 0,
      currentMonthCharge: 0,
      totalPaidThisFinancialYear: 0,
      lastPaymentAmount: null,
      lastPaymentDate: null,
      nextDueDate: null,
    },
    complaintSummary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    visitorHistory: [],
  }
}

export interface ResidentService {
  getResidents(query?: ResidentListQuery): Promise<ResidentListResponse>
  getResidentById(id: string): Promise<ResidentDetails>
  createResident(data: CreateResidentRequest): Promise<ResidentDetails>
  updateResident(id: string, data: UpdateResidentRequest): Promise<ResidentDetails>
  approveResident(id: string): Promise<ResidentDetails>
  rejectResident(id: string): Promise<ResidentDetails>
  activateResident(id: string): Promise<ResidentDetails>
  deactivateResident(id: string): Promise<ResidentDetails>
  blockResident(id: string): Promise<ResidentDetails>
  unblockResident(id: string): Promise<ResidentDetails>
  promoteResidentRole(id: string): Promise<ResidentDetails>
  demoteResidentRoleByEmail(email: string): Promise<void>
  removeResident(id: string): Promise<ResidentDetails>
}

export const residentService: ResidentService = {
  async getResidents(query = {}) {
    const params: any = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      ownershipType: query.ownershipType ? (query.ownershipType === "owner" ? "Owner" : "Tenant") : undefined,
      status: query.approvalStatus === "approved" ? "Active" : query.approvalStatus === "pending" ? "Inactive" : undefined,
    }

    if (query.tower) {
      const towersRes = await api.get<{ towers: any[] }>("/towers?limit=100")
      const dbTower = towersRes.data.towers.find((t: any) =>
        t.towerName.toLowerCase() === query.tower!.toLowerCase() ||
        t.towerName.toLowerCase() === `tower ${query.tower!.replace("tower-", "")}`.toLowerCase() ||
        t.towerName.toLowerCase() === query.tower!.replace("-", " ").toLowerCase()
      )
      if (dbTower) {
        params.towerId = dbTower._id
      }
    }

    if (query.sort) {
      if (query.sort === "oldest") {
        params.sortBy = "moveInDate"
        params.sortOrder = "asc"
      } else {
        params.sortBy = "moveInDate"
        params.sortOrder = "desc"
      }
    }

    const res = await api.get<{ residents: any[]; pagination: any }>("/residents", { params })
    return {
      items: res.data.residents.map(mapBackendResidentToFrontend),
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }
  },

  async getResidentById(id) {
    const res = await api.get<{ resident: any; familyMembers: any[] }>(`/residents/${id}`)
    const details = mapBackendResidentToFrontend(res.data.resident)
    if (res.data.familyMembers) {
      details.familyMembers = res.data.familyMembers.map((m: any) => ({
        id: m._id,
        residentId: m.residentId,
        name: m.name,
        relation: m.relation,
        gender: m.gender.toLowerCase() as any,
        dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
        mobile: m.mobileNumber,
        email: m.email,
        occupation: m.occupation,
      }))
    }
    return details
  },

  async createResident(data) {
    const names = data.fullName.trim().split(/\s+/)
    const firstName = names.shift() || data.fullName.trim()
    const lastName = names.join(" ") || "Resident"

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
        role: "Resident",
      })
      userId = userRes.data.user.id
    }

    const towersRes = await api.get<{ towers: any[] }>("/towers?limit=100")
    const dbTower = towersRes.data.towers.find((t: any) =>
      t.towerName.toLowerCase() === data.towerId.toLowerCase() ||
      t.towerName.toLowerCase() === `tower ${data.towerId.replace("tower-", "")}`.toLowerCase() ||
      t.towerName.toLowerCase() === data.towerId.replace("-", " ").toLowerCase()
    )

    if (!dbTower) {
      throw new Error(`Tower not found for towerId: ${data.towerId}`)
    }

    const flatsRes = await api.get<{ flats: any[] }>(`/flats?towerId=${dbTower._id}&limit=100`)
    const dbFlat = flatsRes.data.flats.find((f: any) => f.flatNumber.toLowerCase() === data.flatNumber.toLowerCase())

    if (!dbFlat) {
      throw new Error(`Flat not found for flatNumber: ${data.flatNumber}`)
    }

    const residentPayload = {
      userId,
      towerId: dbTower._id,
      flatId: dbFlat._id,
      ownershipType: data.ownershipType === "owner" ? "Owner" : "Tenant",
      moveInDate: data.moveInDate,
      emergencyContact: data.emergencyContactNumber || data.mobile,
      bloodGroup: null,
      occupation: "",
      status: "Active",
    }

    const res = await api.post<{ resident: any }>("/residents", residentPayload)
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async updateResident(id, data) {
    const updatePayload: any = {}
    if (data.ownershipType) {
      updatePayload.ownershipType = data.ownershipType === "owner" ? "Owner" : "Tenant"
    }
    if (data.moveInDate) {
      updatePayload.moveInDate = data.moveInDate
    }
    if (data.emergencyContactNumber) {
      updatePayload.emergencyContact = data.emergencyContactNumber
    }

    if (data.towerId && data.flatNumber) {
      const towersRes = await api.get<{ towers: any[] }>("/towers?limit=100")
      const dbTower = towersRes.data.towers.find((t: any) =>
        t.towerName.toLowerCase() === data.towerId!.toLowerCase() ||
        t.towerName.toLowerCase() === `tower ${data.towerId!.replace("tower-", "")}`.toLowerCase() ||
        t.towerName.toLowerCase() === data.towerId!.replace("-", " ").toLowerCase()
      )
      if (dbTower) {
        updatePayload.towerId = dbTower._id
        const flatsRes = await api.get<{ flats: any[] }>(`/flats?towerId=${dbTower._id}&limit=100`)
        const dbFlat = flatsRes.data.flats.find((f: any) => f.flatNumber.toLowerCase() === data.flatNumber!.toLowerCase())
        if (dbFlat) {
          updatePayload.flatId = dbFlat._id
        }
      }
    }

    const res = await api.put<{ resident: any }>(`/residents/${id}`, updatePayload)
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async approveResident(id) {
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Active" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async rejectResident(id) {
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Inactive" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async activateResident(id) {
    const details = await this.getResidentById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (user) {
      await api.patch(`/users/${user.id}/status`, { isActive: true })
    }
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Active" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async deactivateResident(id) {
    const details = await this.getResidentById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (user) {
      await api.patch(`/users/${user.id}/status`, { isActive: false })
    }
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Inactive" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async blockResident(id) {
    const details = await this.getResidentById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (user) {
      await api.patch(`/users/${user.id}/status`, { isActive: false })
    }
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Inactive" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async unblockResident(id) {
    const details = await this.getResidentById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (user) {
      await api.patch(`/users/${user.id}/status`, { isActive: true })
    }
    const res = await api.patch<{ resident: any }>(`/residents/${id}/status`, { status: "Active" })
    return mapBackendResidentToFrontend(res.data.resident)
  },

  async promoteResidentRole(id) {
    const details = await this.getResidentById(id)
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${details.email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === details.email.toLowerCase())
    if (!user) throw new Error("User not found")

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

    return {
      ...details,
      role: "committee_member" as any,
    }
  },

  async demoteResidentRoleByEmail(email) {
    const usersRes = await api.get<{ users: any[] }>(`/users?search=${email}`)
    const user = usersRes.data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (user) {
      await api.put(`/users/${user.id}`, { role: "Resident" })
    }
  },

  async removeResident(id) {
    const details = await this.getResidentById(id)
    await api.delete(`/residents/${id}`)
    return details
  },
}
