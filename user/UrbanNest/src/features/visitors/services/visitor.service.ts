import { api } from "@/services/api-client"
import type {
  VisitorListQuery,
  VisitorListResponse,
  VisitorPass,
  VisitorPassInput,
  VisitorReport,
} from "@/features/visitors/types/visitor.types"

function mapBackendVisitorToFrontend(v: any): VisitorPass {
  return {
    id: v._id,
    residentId: v.residentId || "",
    residentName: v.residentName,
    tower: v.tower,
    flatNumber: v.flatNumber,
    visitorName: v.visitorName,
    mobile: v.mobile,
    purpose: v.purpose,
    purposeNote: v.purposeNote,
    visitDate: v.visitDate,
    status: v.status,
    qrCode: v.qrCode,
    vehicleNumber: v.vehicleNumber || undefined,
    checkedInAt: v.checkedInAt || undefined,
    checkedOutAt: v.checkedOutAt || undefined,
    verifiedBy: v.verifiedBy || undefined,
    createdAt: v.createdAt,
    validFrom: v.validFrom || "09:00",
    validUntil: v.validUntil || "18:00",
  }
}

export const visitorService = {
  async list(query: VisitorListQuery = {}): Promise<VisitorListResponse> {
    const params: any = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
      purpose: query.purpose,
      residentId: query.residentId,
    }

    const res = await api.get<{ visitors: any[]; pagination: any }>("/visitors", { params })
    return {
      items: res.data.visitors.map(mapBackendVisitorToFrontend),
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    }
  },

  async details(id: string): Promise<VisitorPass> {
    const res = await api.get<{ visitor: any }>(`/visitors/${id}`)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async create(
    input: VisitorPassInput,
    resident: { id: string; name: string; tower: string; flatNumber: string }
  ): Promise<VisitorPass> {
    const payload = {
      ...input,
      residentId: resident.id === "mock-resident" ? undefined : resident.id,
      residentName: input.residentName || resident.name,
      tower: input.tower || resident.tower,
      flatNumber: input.flatNumber || resident.flatNumber,
    }

    const res = await api.post<{ visitor: any }>("/visitors", payload)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async verify(code: string): Promise<VisitorPass> {
    let cleanCode = code.trim()
    if (cleanCode.includes("code=")) {
      const parts = cleanCode.split("code=")
      if (parts[1]) cleanCode = parts[1].split("&")[0]
    }
    const res = await api.get<{ visitor: any }>(`/visitors/code/${cleanCode}`)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async checkIn(id: string): Promise<VisitorPass> {
    const res = await api.patch<{ visitor: any }>(`/visitors/${id}/check-in`)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async checkOut(id: string): Promise<VisitorPass> {
    const res = await api.patch<{ visitor: any }>(`/visitors/${id}/check-out`)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async cancel(id: string): Promise<VisitorPass> {
    const res = await api.patch<{ visitor: any }>(`/visitors/${id}/cancel`)
    return mapBackendVisitorToFrontend(res.data.visitor)
  },

  async report(): Promise<VisitorReport> {
    const res = await api.get<VisitorReport>("/visitors/report")
    return res.data
  },
}

export type VisitorService = typeof visitorService
