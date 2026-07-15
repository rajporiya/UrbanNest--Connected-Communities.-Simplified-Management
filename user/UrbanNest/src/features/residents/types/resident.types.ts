export type OwnershipType = "owner" | "tenant" | "family_member"

export type ResidentApprovalStatus = "pending" | "approved" | "rejected"

export type ResidentAccountStatus = "active" | "inactive" | "blocked"

export type ResidentSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "tower_asc"
  | "flat_asc"

export type FamilyMemberGender = "male" | "female" | "other" | "prefer_not_to_say"

export type ResidentVehicleType = "car" | "motorcycle" | "scooter" | "bicycle" | "other"

export interface ResidentTower {
  id: string
  name: string
}

export interface ResidentFlat {
  id: string
  towerId: string
  number: string
  floor: number
}

export interface EmergencyContact {
  name: string
  mobile: string
  relationship: string
}

export interface Resident {
  id: string
  role: "resident"
  fullName: string
  email: string
  mobile: string
  dateOfBirth: string | null
  profileImageUrl: string | null
  tower: ResidentTower
  flat: ResidentFlat
  ownershipType: OwnershipType
  approvalStatus: ResidentApprovalStatus
  accountStatus: ResidentAccountStatus
  moveInDate: string
  emergencyContact: EmergencyContact | null
  familyMemberCount: number
  vehicleCount: number
  notes: string
  joinedAt: string
  createdAt: string
  updatedAt: string
}

export type ResidentListItem = Resident

export interface FamilyMember {
  id: string
  residentId: string
  name: string
  relation: string
  gender: FamilyMemberGender
  dateOfBirth: string
  mobile: string | null
  email: string | null
  occupation: string | null
}

export interface ResidentVehicle {
  id: string
  residentId: string
  registrationNumber: string
  type: ResidentVehicleType
  make: string
  model: string
  color: string
  parkingSlot: string | null
}

export interface ResidentMaintenanceSummary {
  outstandingAmount: number
  currentMonthCharge: number
  totalPaidThisFinancialYear: number
  lastPaymentAmount: number | null
  lastPaymentDate: string | null
  nextDueDate: string | null
}

export interface ResidentComplaintSummary {
  total: number
  open: number
  inProgress: number
  resolved: number
}

export type VisitorVisitStatus = "expected" | "checked_in" | "checked_out" | "cancelled"

export interface ResidentVisitorHistoryItem {
  id: string
  residentId: string
  visitorName: string
  purpose: string
  visitedAt: string
  status: VisitorVisitStatus
}

export interface ResidentDetails extends Resident {
  familyMembers: FamilyMember[]
  vehicles: ResidentVehicle[]
  maintenance: ResidentMaintenanceSummary
  complaintSummary: ResidentComplaintSummary
  visitorHistory: ResidentVisitorHistoryItem[]
}

export interface CreateResidentRequest {
  fullName: string
  email: string
  mobile: string
  dateOfBirth?: string
  profileImageUrl?: string
  towerId: string
  flatNumber: string
  floor: number
  ownershipType: OwnershipType
  moveInDate: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  emergencyContactRelationship?: string
  familyMemberCount: number
  vehicleCount: number
  notes?: string
}

export type UpdateResidentRequest = Partial<CreateResidentRequest>

export interface ResidentListQuery {
  page?: number
  limit?: number
  search?: string
  approvalStatus?: ResidentApprovalStatus
  accountStatus?: ResidentAccountStatus
  tower?: string
  ownershipType?: OwnershipType
  sort?: ResidentSortOption
}

export interface ResidentListResponse {
  items: ResidentListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ResidentTowerOption = ResidentTower

export type ResidentFlatOption = ResidentFlat
