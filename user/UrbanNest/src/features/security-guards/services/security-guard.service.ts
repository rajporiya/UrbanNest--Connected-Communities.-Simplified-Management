import { api } from "@/services/api-client"
import type {
  CreateSecurityGuardRequest,
  SecurityGuardDetails,
  SecurityGuardListQuery,
  SecurityGuardListResponse,
  UpdateSecurityGuardRequest,
} from "@/features/security-guards/types/security-guard.types"

function mapBackendSecurityGuardToFrontend(g: any): SecurityGuardDetails {
  let emergencyContactName = "Emergency"
  let emergencyContactNumber = "9999999999"
  let emergencyContactRelationship = "Contact"
  if (g.emergencyContact) {
    const parts = g.emergencyContact.split(",")
    if (parts.length >= 2) {
      emergencyContactName = parts[0].trim()
      emergencyContactNumber = parts[1].trim()
      if (parts[2]) emergencyContactRelationship = parts[2].trim()
    } else {
      emergencyContactNumber = g.emergencyContact.trim()
    }
  }

  return {
    id: g._id,
    role: "security_guard",
    fullName: `${g.userId.firstName} ${g.userId.lastName}`.trim(),
    email: g.userId.email,
    mobile: g.userId.phone || g.contactNumber,
    employeeId: g.employeeId,
    profileImageUrl: g.userId.profileImage?.secure_url || null,
    gate: g.gate,
    shift: {
      name: g.shift,
      startTime: g.shiftStartTime,
      endTime: g.shiftEndTime,
    },
    joiningDate: g.joiningDate ? g.joiningDate.split("T")[0] : "",
    emergencyContact: {
      name: emergencyContactName,
      mobile: emergencyContactNumber,
      relationship: emergencyContactRelationship,
    },
    status: g.status === "Active" ? "active" : "inactive",
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    visitorHistory: [],
    shiftHistory: [],
    attendance: [],
  }
}

export interface SecurityGuardService {
  getSecurityGuards(query?: SecurityGuardListQuery): Promise<SecurityGuardListResponse>
  getSecurityGuardById(id: string): Promise<SecurityGuardDetails>
  createSecurityGuard(data: CreateSecurityGuardRequest): Promise<SecurityGuardDetails>
  updateSecurityGuard(
    id: string,
    data: UpdateSecurityGuardRequest,
  ): Promise<SecurityGuardDetails>
  deleteSecurityGuard(id: string): Promise<void>
  activateSecurityGuard(id: string): Promise<SecurityGuardDetails>
  deactivateSecurityGuard(id: string): Promise<SecurityGuardDetails>
}

export const securityGuardService: SecurityGuardService = {
  async getSecurityGuards(query = {}) {
    const params: any = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      gate: query.gate,
      shift: query.shift,
      status: query.status === "active" ? "Active" : query.status === "inactive" ? "Inactive" : undefined,
    }

    const res = await api.get<{ guards: any[]; pagination: any }>("/security-guards", { params })
    return {
      items: res.data.guards.map(mapBackendSecurityGuardToFrontend),
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }
  },

  async getSecurityGuardById(id) {
    const res = await api.get<{ guard: any }>(`/security-guards/${id}`)
    return mapBackendSecurityGuardToFrontend(res.data.guard)
  },

  async createSecurityGuard(data) {
    const names = data.fullName.trim().split(/\s+/)
    const firstName = names.shift() || data.fullName.trim()
    const lastName = names.join(" ") || "Guard"

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
        role: "Security Guard",
      })
      userId = userRes.data.user.id
    }

    const emergencyContact = `${data.emergencyContactName}, ${data.emergencyContactNumber}, ${data.emergencyContactRelationship}`
    const guardRes = await api.post<{ guard: any }>("/security-guards", {
      userId,
      employeeId: data.employeeId,
      gate: data.gate,
      shift: data.shiftName,
      joiningDate: data.joiningDate,
      contactNumber: data.mobile,
      emergencyContact,
      status: data.status === "active" ? "Active" : "Inactive",
    })
    return mapBackendSecurityGuardToFrontend(guardRes.data.guard)
  },

  async updateSecurityGuard(id, data) {
    const updatePayload: any = {}
    if (data.employeeId) updatePayload.employeeId = data.employeeId
    if (data.gate) updatePayload.gate = data.gate
    if (data.shiftName) updatePayload.shift = data.shiftName
    if (data.joiningDate) updatePayload.joiningDate = data.joiningDate
    if (data.status) updatePayload.status = data.status === "active" ? "Active" : "Inactive"
    if (data.emergencyContactName && data.emergencyContactNumber) {
      updatePayload.emergencyContact = `${data.emergencyContactName}, ${data.emergencyContactNumber}, ${data.emergencyContactRelationship || ""}`
    }

    const res = await api.put<{ guard: any }>(`/security-guards/${id}`, updatePayload)
    return mapBackendSecurityGuardToFrontend(res.data.guard)
  },

  async deleteSecurityGuard(id) {
    await api.delete(`/security-guards/${id}`)
  },

  async activateSecurityGuard(id) {
    const res = await api.patch<{ guard: any }>(`/security-guards/${id}/status`, { status: "Active" })
    return mapBackendSecurityGuardToFrontend(res.data.guard)
  },

  async deactivateSecurityGuard(id) {
    const res = await api.patch<{ guard: any }>(`/security-guards/${id}/status`, { status: "Inactive" })
    return mapBackendSecurityGuardToFrontend(res.data.guard)
  },
}
