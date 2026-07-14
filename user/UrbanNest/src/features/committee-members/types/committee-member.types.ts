export type CommitteeMemberStatus = "active" | "inactive"

export type CommitteeMemberSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "department_asc"

export type CommitteeActivityType =
  | "complaint"
  | "booking"
  | "profile"
  | "status"

export type CommitteeAssignmentStatus =
  | "pending"
  | "active"
  | "resolved"
  | "closed"

export interface CommitteeMember {
  id: string
  role: "committee_member"
  fullName: string
  email: string
  mobile: string
  profileImageUrl: string | null
  department: string
  designation: string
  responsibilities: string[]
  joinedDate: string
  status: CommitteeMemberStatus
  removedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CommitteeMemberListItem = CommitteeMember

export interface AssignedComplaint {
  id: string
  title: string
  category: string
  residentName: string
  priority: "low" | "medium" | "high" | "emergency"
  status: CommitteeAssignmentStatus
  assignedAt: string
}

export interface AssignedBooking {
  id: string
  amenityName: string
  residentName: string
  bookingDate: string
  timeSlot: string
  status: "pending" | "approved" | "rejected"
}

export interface CommitteeActivityLogItem {
  id: string
  type: CommitteeActivityType
  title: string
  description: string
  occurredAt: string
}

export interface CommitteeMemberDetails extends CommitteeMember {
  assignedComplaints: AssignedComplaint[]
  assignedBookings: AssignedBooking[]
  activityLog: CommitteeActivityLogItem[]
}

export interface CreateCommitteeMemberRequest {
  fullName: string
  email: string
  mobile: string
  profileImageUrl?: string
  department: string
  designation: string
  responsibilities: string[]
  joinedDate: string
  status: CommitteeMemberStatus
}

export type UpdateCommitteeMemberRequest = Partial<CreateCommitteeMemberRequest>

export interface CommitteeMemberListQuery {
  page?: number
  limit?: number
  search?: string
  department?: string
  status?: CommitteeMemberStatus
  responsibility?: string
  sort?: CommitteeMemberSortOption
}

export interface CommitteeMemberListResponse {
  items: CommitteeMemberListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

