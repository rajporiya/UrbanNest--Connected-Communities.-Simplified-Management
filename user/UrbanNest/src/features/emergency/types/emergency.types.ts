export type EmergencyType =
  "medical" | "fire" | "security" | "accident" | "other"
export type EmergencyStatus = "pending" | "responded" | "closed"
export type EmergencySort = "newest" | "oldest" | "priority"
export interface EmergencyAlert {
  id: string
  type: EmergencyType
  message: string
  residentId: string
  residentName: string
  tower: string
  flatNumber: string
  mobile: string
  status: EmergencyStatus
  respondedBy?: string
  respondedAt?: string
  closedAt?: string
  createdAt: string
}
export interface EmergencyInput {
  type: EmergencyType
  message: string
  mobile: string
}
export interface EmergencyListQuery {
  page?: number
  limit?: number
  search?: string
  type?: EmergencyType
  status?: EmergencyStatus
  sort?: EmergencySort
  residentId?: string
}
export interface EmergencyListResponse {
  items: EmergencyAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
}
