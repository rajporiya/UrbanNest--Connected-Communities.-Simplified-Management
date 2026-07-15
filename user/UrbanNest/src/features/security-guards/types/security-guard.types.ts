export type GuardStatus = "active" | "inactive"

export type GuardGate =
  | "Main Gate"
  | "Gate A"
  | "Gate B"
  | "Gate C"
  | "Parking Gate"
  | "Service Gate"

export type GuardShiftName = "Morning" | "Afternoon" | "Evening" | "Night"

export type SecurityGuardSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "employee_id_asc"
  | "gate_asc"
  | "shift_asc"

export interface GuardShift {
  name: GuardShiftName
  startTime: string
  endTime: string
}

export interface GuardEmergencyContact {
  name: string
  mobile: string
  relationship: string
}

export interface SecurityGuard {
  id: string
  role: "security_guard"
  fullName: string
  email: string
  mobile: string
  employeeId: string
  profileImageUrl: string | null
  gate: GuardGate
  shift: GuardShift
  joiningDate: string
  emergencyContact: GuardEmergencyContact
  status: GuardStatus
  createdAt: string
  updatedAt: string
}

export type SecurityGuardListItem = SecurityGuard

export type GuardVisitorStatus = "checked_in" | "checked_out" | "denied"

export interface GuardVisitorHistoryItem {
  id: string
  guardId: string
  visitorName: string
  visitorMobile: string
  purpose: string
  gate: GuardGate
  checkedInAt: string
  checkedOutAt: string | null
  status: GuardVisitorStatus
}

export interface GuardShiftHistoryItem {
  id: string
  guardId: string
  gate: GuardGate
  shift: GuardShift
  assignedFrom: string
  assignedUntil: string | null
  changeReason: string
}

export type GuardAttendanceStatus = "present" | "absent" | "late" | "leave"

export interface GuardAttendanceItem {
  id: string
  guardId: string
  date: string
  shift: GuardShift
  clockIn: string | null
  clockOut: string | null
  status: GuardAttendanceStatus
}

export interface SecurityGuardDetails extends SecurityGuard {
  visitorHistory: GuardVisitorHistoryItem[]
  shiftHistory: GuardShiftHistoryItem[]
  attendance: GuardAttendanceItem[]
}

export interface CreateSecurityGuardRequest {
  fullName: string
  email: string
  mobile: string
  employeeId: string
  profileImageUrl?: string
  gate: GuardGate
  shiftName: GuardShiftName
  shiftStartTime: string
  shiftEndTime: string
  joiningDate: string
  emergencyContactName: string
  emergencyContactNumber: string
  emergencyContactRelationship: string
  status: GuardStatus
}

export type UpdateSecurityGuardRequest = Partial<CreateSecurityGuardRequest>

export interface SecurityGuardListQuery {
  page?: number
  limit?: number
  search?: string
  gate?: GuardGate
  shift?: GuardShiftName
  status?: GuardStatus
  sort?: SecurityGuardSortOption
}

export interface SecurityGuardListResponse {
  items: SecurityGuardListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
