import type {
  AssignedBooking,
  AssignedComplaint,
  CommitteeActivityLogItem,
  CommitteeMemberDetails,
  CommitteeMemberStatus,
} from "@/features/committee-members/types/committee-member.types"

export const committeeDepartments = [
  "Administration",
  "Maintenance",
  "Finance",
  "Security",
  "Cultural",
  "Parking",
  "Water Supply",
  "Electricity",
  "Housekeeping",
  "Garden",
  "Events",
] as const

export const committeeResponsibilities = [
  "Manage Complaints",
  "Manage Visitors",
  "Manage Announcements",
  "Manage Amenities",
  "Manage Billing",
  "Manage Payments",
  "Manage Parking",
  "Manage Documents",
  "Manage Events",
  "View Reports",
  "Manage Residents",
  "Manage Security Guards",
] as const

interface CommitteeMemberSeed {
  id: string
  fullName: string
  email: string
  mobile: string
  profileImageUrl: string | null
  department: (typeof committeeDepartments)[number]
  designation: string
  responsibilities: string[]
  joinedDate: string
  status: CommitteeMemberStatus
}

const committeeMemberSeeds: CommitteeMemberSeed[] = [
  { id: "committee-001", fullName: "Anjali Deshmukh", email: "anjali.deshmukh@urbannest.test", mobile: "9876501201", profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80", department: "Administration", designation: "Joint Secretary", responsibilities: ["Manage Residents", "Manage Announcements", "Manage Documents"], joinedDate: "2022-04-18", status: "active" },
  { id: "committee-002", fullName: "Vikram Rao", email: "vikram.rao@urbannest.test", mobile: "9876501202", profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80", department: "Maintenance", designation: "Maintenance Coordinator", responsibilities: ["Manage Complaints", "View Reports"], joinedDate: "2023-01-12", status: "active" },
  { id: "committee-003", fullName: "Meera Shah", email: "meera.shah@urbannest.test", mobile: "9876501203", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80", department: "Finance", designation: "Finance Coordinator", responsibilities: ["Manage Billing", "Manage Payments", "View Reports"], joinedDate: "2021-08-05", status: "active" },
  { id: "committee-004", fullName: "Siddharth Jain", email: "siddharth.jain@urbannest.test", mobile: "9876501204", profileImageUrl: null, department: "Security", designation: "Security Liaison", responsibilities: ["Manage Visitors", "Manage Security Guards"], joinedDate: "2024-02-20", status: "active" },
  { id: "committee-005", fullName: "Nisha Kapoor", email: "nisha.kapoor@urbannest.test", mobile: "9876501205", profileImageUrl: null, department: "Cultural", designation: "Cultural Secretary", responsibilities: ["Manage Events", "Manage Announcements"], joinedDate: "2023-06-14", status: "inactive" },
  { id: "committee-006", fullName: "Aditya Kulkarni", email: "aditya.kulkarni@urbannest.test", mobile: "9876501206", profileImageUrl: null, department: "Parking", designation: "Parking Coordinator", responsibilities: ["Manage Parking", "Manage Complaints"], joinedDate: "2024-09-09", status: "active" },
  { id: "committee-007", fullName: "Farah Khan", email: "farah.khan@urbannest.test", mobile: "9876501207", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80", department: "Events", designation: "Events Coordinator", responsibilities: ["Manage Events", "Manage Amenities"], joinedDate: "2025-01-17", status: "active" },
  { id: "committee-008", fullName: "Rohit Bhatia", email: "rohit.bhatia@urbannest.test", mobile: "9876501208", profileImageUrl: null, department: "Water Supply", designation: "Utilities Coordinator", responsibilities: ["Manage Complaints", "View Reports"], joinedDate: "2022-11-23", status: "inactive" },
  { id: "committee-009", fullName: "Pooja Menon", email: "pooja.menon@urbannest.test", mobile: "9876501209", profileImageUrl: null, department: "Housekeeping", designation: "Housekeeping Coordinator", responsibilities: ["Manage Complaints", "Manage Residents"], joinedDate: "2025-03-08", status: "active" },
  { id: "committee-010", fullName: "Kunal Arora", email: "kunal.arora@urbannest.test", mobile: "9876501210", profileImageUrl: null, department: "Electricity", designation: "Electrical Coordinator", responsibilities: ["Manage Complaints", "Manage Documents"], joinedDate: "2023-10-02", status: "active" },
  { id: "committee-011", fullName: "Tanvi Joshi", email: "tanvi.joshi@urbannest.test", mobile: "9876501211", profileImageUrl: null, department: "Garden", designation: "Green Spaces Coordinator", responsibilities: ["Manage Complaints", "Manage Events"], joinedDate: "2024-05-19", status: "active" },
  { id: "committee-012", fullName: "Manish Gupta", email: "manish.gupta@urbannest.test", mobile: "9876501212", profileImageUrl: null, department: "Administration", designation: "Records Coordinator", responsibilities: ["Manage Documents", "View Reports"], joinedDate: "2021-12-10", status: "inactive" },
]

function createComplaints(seed: CommitteeMemberSeed, index: number): AssignedComplaint[] {
  if (!seed.responsibilities.includes("Manage Complaints")) return []

  return [
    {
      id: `complaint-${seed.id}-01`,
      title: index % 2 === 0 ? "Common-area lighting issue" : "Water pressure concern",
      category: index % 2 === 0 ? "Electricity" : "Water Supply",
      residentName: index % 2 === 0 ? "Rajesh Sharma" : "Priya Nair",
      priority: index % 3 === 0 ? "high" : "medium",
      status: index % 2 === 0 ? "active" : "pending",
      assignedAt: "2026-07-08T09:30:00.000Z",
    },
  ]
}

function createBookings(seed: CommitteeMemberSeed, index: number): AssignedBooking[] {
  if (!seed.responsibilities.some((item) => item === "Manage Amenities" || item === "Manage Events")) return []

  return [
    {
      id: `booking-${seed.id}-01`,
      amenityName: index % 2 === 0 ? "Community Hall" : "Clubhouse",
      residentName: index % 2 === 0 ? "Meera Joshi" : "Rohan Das",
      bookingDate: "2026-07-24",
      timeSlot: "18:00 - 21:00",
      status: index % 2 === 0 ? "approved" : "pending",
    },
  ]
}

function createActivity(seed: CommitteeMemberSeed, index: number): CommitteeActivityLogItem[] {
  return [
    {
      id: `activity-${seed.id}-01`,
      type: "profile",
      title: "Profile reviewed",
      description: "Committee member information was reviewed by the Committee Head.",
      occurredAt: "2026-07-12T10:15:00.000Z",
    },
    {
      id: `activity-${seed.id}-02`,
      type: index % 2 === 0 ? "complaint" : "booking",
      title: index % 2 === 0 ? "Complaint assignment updated" : "Booking review completed",
      description: index % 2 === 0 ? "An assigned complaint was moved to in progress." : "An amenity request was reviewed.",
      occurredAt: "2026-07-09T14:40:00.000Z",
    },
  ]
}

export const mockCommitteeMembers: CommitteeMemberDetails[] = committeeMemberSeeds.map(
  (seed, index) => {
    const createdAt = `${seed.joinedDate}T09:00:00.000Z`
    return {
      ...seed,
      role: "committee_member",
      removedAt: null,
      createdAt,
      updatedAt: "2026-07-12T10:15:00.000Z",
      assignedComplaints: createComplaints(seed, index),
      assignedBookings: createBookings(seed, index),
      activityLog: createActivity(seed, index),
    }
  },
)

