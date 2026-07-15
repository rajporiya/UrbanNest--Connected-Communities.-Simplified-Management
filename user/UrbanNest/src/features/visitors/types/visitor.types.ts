export type VisitorPurpose = "guest" | "delivery" | "service" | "cab" | "other"
export type VisitorStatus =
  "expected" | "checked-in" | "checked-out" | "cancelled"
export type VisitorSort = "visit_desc" | "visit_asc" | "name_asc" | "name_desc"

export interface VisitorPass {
  id: string
  visitorName: string
  mobile: string
  purpose: VisitorPurpose
  purposeNote: string
  residentId: string
  residentName: string
  tower: string
  flatNumber: string
  visitDate: string
  validFrom: string
  validUntil: string
  vehicleNumber?: string
  qrCode: string
  status: VisitorStatus
  checkedInAt?: string
  checkedOutAt?: string
  verifiedBy?: string
  createdAt: string
}

export interface VisitorPassInput {
  visitorName: string
  mobile: string
  purpose: VisitorPurpose
  purposeNote: string
  visitDate: string
  validFrom: string
  validUntil: string
  vehicleNumber?: string
  residentName?: string
  tower?: string
  flatNumber?: string
}

export interface VisitorListQuery {
  page?: number
  limit?: number
  search?: string
  status?: VisitorStatus
  purpose?: VisitorPurpose
  sort?: VisitorSort
  residentId?: string
}

export interface VisitorListResponse {
  items: VisitorPass[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface VisitorReport {
  total: number
  expected: number
  inside: number
  completed: number
  today: number
}
