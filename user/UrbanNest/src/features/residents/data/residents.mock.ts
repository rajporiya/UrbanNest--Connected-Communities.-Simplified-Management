import type {
  EmergencyContact,
  FamilyMember,
  OwnershipType,
  Resident,
  ResidentAccountStatus,
  ResidentApprovalStatus,
  ResidentComplaintSummary,
  ResidentDetails,
  ResidentFlatOption,
  ResidentListItem,
  ResidentMaintenanceSummary,
  ResidentTowerOption,
  ResidentVehicle,
  ResidentVisitorHistoryItem,
} from "@/features/residents/types/resident.types"

export const towerOptions: ResidentTowerOption[] = [
  { id: "tower-a", name: "Tower A" },
  { id: "tower-b", name: "Tower B" },
  { id: "tower-c", name: "Tower C" },
  { id: "tower-d", name: "Tower D" },
]

export const flatOptions: ResidentFlatOption[] = [
  { id: "flat-a-101", towerId: "tower-a", number: "A-101", floor: 1 },
  { id: "flat-a-203", towerId: "tower-a", number: "A-203", floor: 2 },
  { id: "flat-a-404", towerId: "tower-a", number: "A-404", floor: 4 },
  { id: "flat-b-102", towerId: "tower-b", number: "B-102", floor: 1 },
  { id: "flat-b-304", towerId: "tower-b", number: "B-304", floor: 3 },
  { id: "flat-b-602", towerId: "tower-b", number: "B-602", floor: 6 },
  { id: "flat-c-103", towerId: "tower-c", number: "C-103", floor: 1 },
  { id: "flat-c-302", towerId: "tower-c", number: "C-302", floor: 3 },
  { id: "flat-c-501", towerId: "tower-c", number: "C-501", floor: 5 },
  { id: "flat-d-104", towerId: "tower-d", number: "D-104", floor: 1 },
  { id: "flat-d-202", towerId: "tower-d", number: "D-202", floor: 2 },
  { id: "flat-d-703", towerId: "tower-d", number: "D-703", floor: 7 },
]

interface ResidentSeed {
  id: string
  fullName: string
  email: string
  mobile: string
  dateOfBirth: string
  profileImageUrl: string | null
  flatId: string
  ownershipType: OwnershipType
  approvalStatus: ResidentApprovalStatus
  accountStatus: ResidentAccountStatus
  moveInDate: string
  emergencyContact: EmergencyContact | null
  familyMemberCount: number
  vehicleCount: number
  notes: string
  joinedAt: string
  updatedAt: string
}

const residentSeeds: ResidentSeed[] = [
  {
    id: "resident-001",
    fullName: "Rajesh Sharma",
    email: "rajesh.sharma@example.com",
    mobile: "9876543210",
    dateOfBirth: "1984-03-18",
    profileImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
    flatId: "flat-a-101",
    ownershipType: "owner",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2021-06-12",
    emergencyContact: { name: "Sunita Sharma", mobile: "9820012345", relationship: "Spouse" },
    familyMemberCount: 3,
    vehicleCount: 2,
    notes: "Member of the society gardening group.",
    joinedAt: "2021-06-10T09:15:00.000Z",
    updatedAt: "2026-06-28T11:30:00.000Z",
  },
  {
    id: "resident-002",
    fullName: "Priya Nair",
    email: "priya.nair@example.com",
    mobile: "9765432108",
    dateOfBirth: "1992-08-07",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    flatId: "flat-a-203",
    ownershipType: "tenant",
    approvalStatus: "pending",
    accountStatus: "inactive",
    moveInDate: "2026-07-01",
    emergencyContact: { name: "Gopal Nair", mobile: "9987654321", relationship: "Father" },
    familyMemberCount: 1,
    vehicleCount: 1,
    notes: "Rental agreement verification is pending.",
    joinedAt: "2026-06-30T14:20:00.000Z",
    updatedAt: "2026-06-30T14:20:00.000Z",
  },
  {
    id: "resident-003",
    fullName: "Amit Patel",
    email: "amit.patel@example.com",
    mobile: "9898981212",
    dateOfBirth: "1979-11-25",
    profileImageUrl: null,
    flatId: "flat-b-304",
    ownershipType: "owner",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2020-02-15",
    emergencyContact: { name: "Hetal Patel", mobile: "9811122233", relationship: "Spouse" },
    familyMemberCount: 4,
    vehicleCount: 2,
    notes: "",
    joinedAt: "2020-02-12T06:40:00.000Z",
    updatedAt: "2026-05-12T08:10:00.000Z",
  },
  {
    id: "resident-004",
    fullName: "Neha Verma",
    email: "neha.verma@example.com",
    mobile: "9123456780",
    dateOfBirth: "1988-01-14",
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    flatId: "flat-b-102",
    ownershipType: "tenant",
    approvalStatus: "approved",
    accountStatus: "inactive",
    moveInDate: "2024-10-03",
    emergencyContact: { name: "Karan Verma", mobile: "9001234567", relationship: "Brother" },
    familyMemberCount: 0,
    vehicleCount: 0,
    notes: "Account temporarily deactivated on request.",
    joinedAt: "2024-10-01T10:05:00.000Z",
    updatedAt: "2026-06-18T15:45:00.000Z",
  },
  {
    id: "resident-005",
    fullName: "Sameer Sharma",
    email: "sameer.sharma@example.com",
    mobile: "9234567891",
    dateOfBirth: "2001-05-22",
    profileImageUrl: null,
    flatId: "flat-a-101",
    ownershipType: "family_member",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2021-06-12",
    emergencyContact: { name: "Rajesh Sharma", mobile: "9876543210", relationship: "Father" },
    familyMemberCount: 0,
    vehicleCount: 1,
    notes: "Adult family member account.",
    joinedAt: "2025-01-06T12:00:00.000Z",
    updatedAt: "2026-04-09T09:25:00.000Z",
  },
  {
    id: "resident-006",
    fullName: "Kavita Iyer",
    email: "kavita.iyer@example.com",
    mobile: "9345678912",
    dateOfBirth: "1986-09-30",
    profileImageUrl: null,
    flatId: "flat-c-501",
    ownershipType: "owner",
    approvalStatus: "rejected",
    accountStatus: "inactive",
    moveInDate: "2026-06-20",
    emergencyContact: { name: "Mohan Iyer", mobile: "9456789123", relationship: "Spouse" },
    familyMemberCount: 2,
    vehicleCount: 1,
    notes: "Submitted ownership document did not match the flat record.",
    joinedAt: "2026-06-19T07:35:00.000Z",
    updatedAt: "2026-06-21T10:50:00.000Z",
  },
  {
    id: "resident-007",
    fullName: "Arjun Mehta",
    email: "arjun.mehta@example.com",
    mobile: "9456123789",
    dateOfBirth: "1990-12-03",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    flatId: "flat-d-202",
    ownershipType: "tenant",
    approvalStatus: "approved",
    accountStatus: "blocked",
    moveInDate: "2023-07-19",
    emergencyContact: { name: "Leena Mehta", mobile: "9567891234", relationship: "Mother" },
    familyMemberCount: 1,
    vehicleCount: 1,
    notes: "Account blocked pending compliance review.",
    joinedAt: "2023-07-17T16:20:00.000Z",
    updatedAt: "2026-07-02T05:45:00.000Z",
  },
  {
    id: "resident-008",
    fullName: "Meera Joshi",
    email: "meera.joshi@example.com",
    mobile: "9567812340",
    dateOfBirth: "1976-06-11",
    profileImageUrl: null,
    flatId: "flat-c-302",
    ownershipType: "owner",
    approvalStatus: "pending",
    accountStatus: "inactive",
    moveInDate: "2026-07-10",
    emergencyContact: { name: "Nikhil Joshi", mobile: "9678912345", relationship: "Son" },
    familyMemberCount: 2,
    vehicleCount: 0,
    notes: "Awaiting committee approval.",
    joinedAt: "2026-07-09T13:10:00.000Z",
    updatedAt: "2026-07-09T13:10:00.000Z",
  },
  {
    id: "resident-009",
    fullName: "Rohan Das",
    email: "rohan.das@example.com",
    mobile: "9678123456",
    dateOfBirth: "1995-02-19",
    profileImageUrl: null,
    flatId: "flat-d-104",
    ownershipType: "tenant",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2025-09-01",
    emergencyContact: { name: "Anita Das", mobile: "9789123456", relationship: "Mother" },
    familyMemberCount: 0,
    vehicleCount: 1,
    notes: "",
    joinedAt: "2025-08-29T08:30:00.000Z",
    updatedAt: "2026-03-15T11:05:00.000Z",
  },
  {
    id: "resident-010",
    fullName: "Ananya Patel",
    email: "ananya.patel@example.com",
    mobile: "9781234567",
    dateOfBirth: "2003-04-06",
    profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80",
    flatId: "flat-b-304",
    ownershipType: "family_member",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2020-02-15",
    emergencyContact: { name: "Amit Patel", mobile: "9898981212", relationship: "Father" },
    familyMemberCount: 0,
    vehicleCount: 0,
    notes: "Adult family member account.",
    joinedAt: "2025-08-14T09:00:00.000Z",
    updatedAt: "2026-02-22T07:40:00.000Z",
  },
  {
    id: "resident-011",
    fullName: "Vijay Kulkarni",
    email: "vijay.kulkarni@example.com",
    mobile: "9891234560",
    dateOfBirth: "1969-10-20",
    profileImageUrl: null,
    flatId: "flat-a-404",
    ownershipType: "owner",
    approvalStatus: "approved",
    accountStatus: "active",
    moveInDate: "2019-12-08",
    emergencyContact: { name: "Usha Kulkarni", mobile: "9901234567", relationship: "Spouse" },
    familyMemberCount: 2,
    vehicleCount: 1,
    notes: "Treasury subcommittee volunteer.",
    joinedAt: "2019-12-05T06:10:00.000Z",
    updatedAt: "2026-01-19T12:35:00.000Z",
  },
  {
    id: "resident-012",
    fullName: "Sana Khan",
    email: "sana.khan@example.com",
    mobile: "9012345678",
    dateOfBirth: "1997-07-27",
    profileImageUrl: null,
    flatId: "flat-c-103",
    ownershipType: "tenant",
    approvalStatus: "rejected",
    accountStatus: "inactive",
    moveInDate: "2026-05-15",
    emergencyContact: null,
    familyMemberCount: 0,
    vehicleCount: 0,
    notes: "Application rejected because residence documents were incomplete.",
    joinedAt: "2026-05-13T17:25:00.000Z",
    updatedAt: "2026-05-16T08:55:00.000Z",
  },
]

const getFlat = (flatId: string) => {
  const flat = flatOptions.find((option) => option.id === flatId)
  if (!flat) throw new Error(`Missing mock flat: ${flatId}`)
  return flat
}

const getTower = (towerId: string) => {
  const tower = towerOptions.find((option) => option.id === towerId)
  if (!tower) throw new Error(`Missing mock tower: ${towerId}`)
  return tower
}

export const mockResidents: ResidentListItem[] = residentSeeds.map((seed): Resident => {
  const flat = getFlat(seed.flatId)

  return {
    id: seed.id,
    role: "resident",
    fullName: seed.fullName,
    email: seed.email,
    mobile: seed.mobile,
    dateOfBirth: seed.dateOfBirth,
    profileImageUrl: seed.profileImageUrl,
    tower: getTower(flat.towerId),
    flat,
    ownershipType: seed.ownershipType,
    approvalStatus: seed.approvalStatus,
    accountStatus: seed.accountStatus,
    moveInDate: seed.moveInDate,
    emergencyContact: seed.emergencyContact,
    familyMemberCount: seed.familyMemberCount,
    vehicleCount: seed.vehicleCount,
    notes: seed.notes,
    joinedAt: seed.joinedAt,
    createdAt: seed.joinedAt,
    updatedAt: seed.updatedAt,
  }
})

export const mockFamilyMembers: FamilyMember[] = [
  { id: "family-001", residentId: "resident-001", name: "Sunita Sharma", relation: "Spouse", gender: "female", dateOfBirth: "1987-09-12", mobile: "9820012345", email: "sunita.sharma@example.com", occupation: "Teacher" },
  { id: "family-002", residentId: "resident-001", name: "Ria Sharma", relation: "Daughter", gender: "female", dateOfBirth: "2010-04-03", mobile: null, email: null, occupation: "Student" },
  { id: "family-003", residentId: "resident-003", name: "Hetal Patel", relation: "Spouse", gender: "female", dateOfBirth: "1982-02-22", mobile: "9811122233", email: "hetal.patel@example.com", occupation: "Architect" },
  { id: "family-004", residentId: "resident-003", name: "Ananya Patel", relation: "Daughter", gender: "female", dateOfBirth: "2003-04-06", mobile: "9781234567", email: "ananya.patel@example.com", occupation: "Designer" },
  { id: "family-005", residentId: "resident-006", name: "Mohan Iyer", relation: "Spouse", gender: "male", dateOfBirth: "1982-12-17", mobile: "9456789123", email: "mohan.iyer@example.com", occupation: "Consultant" },
  { id: "family-006", residentId: "resident-011", name: "Usha Kulkarni", relation: "Spouse", gender: "female", dateOfBirth: "1972-08-09", mobile: "9901234567", email: null, occupation: "Homemaker" },
]

export const mockResidentVehicles: ResidentVehicle[] = [
  { id: "vehicle-001", residentId: "resident-001", registrationNumber: "MH-02-AB-4821", type: "car", make: "Hyundai", model: "Creta", color: "White", parkingSlot: "A-P12" },
  { id: "vehicle-002", residentId: "resident-001", registrationNumber: "MH-02-KL-7330", type: "scooter", make: "Honda", model: "Activa", color: "Grey", parkingSlot: "A-T08" },
  { id: "vehicle-003", residentId: "resident-003", registrationNumber: "MH-04-CD-1188", type: "car", make: "Tata", model: "Nexon", color: "Blue", parkingSlot: "B-P27" },
  { id: "vehicle-004", residentId: "resident-005", registrationNumber: "MH-02-RS-9012", type: "motorcycle", make: "Royal Enfield", model: "Classic 350", color: "Black", parkingSlot: "A-T11" },
  { id: "vehicle-005", residentId: "resident-007", registrationNumber: "MH-01-MN-6621", type: "car", make: "Maruti Suzuki", model: "Baleno", color: "Silver", parkingSlot: "D-P07" },
  { id: "vehicle-006", residentId: "resident-009", registrationNumber: "MH-03-PQ-2019", type: "motorcycle", make: "Bajaj", model: "Pulsar", color: "Red", parkingSlot: "D-T03" },
]

export const mockMaintenanceSummaries: Record<string, ResidentMaintenanceSummary> =
  Object.fromEntries(
    mockResidents.map((resident, index) => [
      resident.id,
      {
        outstandingAmount: resident.accountStatus === "active" ? (index % 4) * 1500 : 0,
        currentMonthCharge: resident.ownershipType === "owner" ? 4500 : 3200,
        totalPaidThisFinancialYear: 18000 + index * 1200,
        lastPaymentAmount: index % 3 === 0 ? 4500 : 3200,
        lastPaymentDate: `2026-0${(index % 6) + 1}-10`,
        nextDueDate: "2026-08-10",
      },
    ]),
  )

export const mockComplaintSummaries: Record<string, ResidentComplaintSummary> =
  Object.fromEntries(
    mockResidents.map((resident, index) => [
      resident.id,
      { total: index % 5, open: index % 3 === 0 ? 1 : 0, inProgress: index % 4 === 0 ? 1 : 0, resolved: index % 3 },
    ]),
  )

export const mockVisitorHistory: ResidentVisitorHistoryItem[] = [
  { id: "visit-001", residentId: "resident-001", visitorName: "Mohit Sharma", purpose: "Family visit", visitedAt: "2026-07-12T10:20:00.000Z", status: "checked_out" },
  { id: "visit-002", residentId: "resident-001", visitorName: "Rakesh Electricals", purpose: "Appliance repair", visitedAt: "2026-07-14T08:30:00.000Z", status: "checked_out" },
  { id: "visit-003", residentId: "resident-003", visitorName: "Dev Shah", purpose: "Personal visit", visitedAt: "2026-07-15T16:00:00.000Z", status: "expected" },
  { id: "visit-004", residentId: "resident-004", visitorName: "Nisha Verma", purpose: "Family visit", visitedAt: "2026-07-09T11:45:00.000Z", status: "checked_out" },
  { id: "visit-005", residentId: "resident-007", visitorName: "QuickFix Plumbing", purpose: "Maintenance", visitedAt: "2026-06-28T05:50:00.000Z", status: "checked_out" },
  { id: "visit-006", residentId: "resident-009", visitorName: "Sneha Das", purpose: "Family visit", visitedAt: "2026-07-13T12:15:00.000Z", status: "checked_in" },
]

const emptyMaintenanceSummary: ResidentMaintenanceSummary = {
  outstandingAmount: 0,
  currentMonthCharge: 0,
  totalPaidThisFinancialYear: 0,
  lastPaymentAmount: null,
  lastPaymentDate: null,
  nextDueDate: null,
}

const emptyComplaintSummary: ResidentComplaintSummary = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
}

export const mockResidentDetails: ResidentDetails[] = mockResidents.map((resident) => ({
  ...resident,
  familyMembers: mockFamilyMembers.filter((member) => member.residentId === resident.id),
  vehicles: mockResidentVehicles.filter((vehicle) => vehicle.residentId === resident.id),
  maintenance: mockMaintenanceSummaries[resident.id] ?? emptyMaintenanceSummary,
  complaintSummary: mockComplaintSummaries[resident.id] ?? emptyComplaintSummary,
  visitorHistory: mockVisitorHistory.filter((visit) => visit.residentId === resident.id),
}))
