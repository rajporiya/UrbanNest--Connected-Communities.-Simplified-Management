import { mockCommitteeMembers } from "@/features/committee-members/data/committee-members.mock"
import type {
  CommitteeMemberDetails,
  CommitteeMemberListItem,
  CommitteeMemberListQuery,
  CommitteeMemberListResponse,
  CommitteeMemberStatus,
  CreateCommitteeMemberRequest,
  UpdateCommitteeMemberRequest,
} from "@/features/committee-members/types/committee-member.types"
import type { ResidentDetails } from "@/features/residents/types/resident.types"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MOCK_DELAY_MS = 250

let committeeMemberStore: CommitteeMemberDetails[] = structuredClone(mockCommitteeMembers)

const clone = <T,>(value: T): T => structuredClone(value)

const normalizeText = (value: string) => value.trim().toLocaleLowerCase()

const normalizePositiveInteger = (value: number | undefined, fallback: number) =>
  Number.isInteger(value) && (value ?? 0) > 0 ? (value as number) : fallback

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS)
  })

function getCommitteeMemberIndex(id: string) {
  const index = committeeMemberStore.findIndex(
    (member) => member.id === id && member.removedAt === null,
  )

  if (index < 0) {
    throw new Error("Committee member not found")
  }

  return index
}

function ensureUniqueContact(email: string, mobile: string, excludedId?: string) {
  const normalizedEmail = normalizeText(email)
  const duplicate = committeeMemberStore.find(
    (member) =>
      member.removedAt === null &&
      member.id !== excludedId &&
      (normalizeText(member.email) === normalizedEmail || member.mobile === mobile),
  )

  if (!duplicate) return

  if (normalizeText(duplicate.email) === normalizedEmail) {
    throw new Error("A committee member with this email already exists")
  }

  throw new Error("A committee member with this mobile number already exists")
}

function replaceCommitteeMember(
  index: number,
  member: CommitteeMemberDetails,
) {
  committeeMemberStore[index] = member
  return clone(member)
}

function toListItem(member: CommitteeMemberDetails): CommitteeMemberListItem {
  return {
    id: member.id,
    role: member.role,
    fullName: member.fullName,
    email: member.email,
    mobile: member.mobile,
    profileImageUrl: member.profileImageUrl,
    department: member.department,
    designation: member.designation,
    responsibilities: [...member.responsibilities],
    joinedDate: member.joinedDate,
    status: member.status,
    removedAt: member.removedAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  }
}

async function updateStatus(id: string, status: CommitteeMemberStatus) {
  await waitForMockResponse()
  const index = getCommitteeMemberIndex(id.trim())
  const current = committeeMemberStore[index]
  const now = new Date().toISOString()

  if (current.status === status) {
    return clone(current)
  }

  return replaceCommitteeMember(index, {
    ...current,
    status,
    updatedAt: now,
    activityLog: [
      {
        id: `activity-${globalThis.crypto.randomUUID()}`,
        type: "status",
        title: `Account ${status}`,
        description: `Committee member access was ${status} by the Committee Head.`,
        occurredAt: now,
      },
      ...current.activityLog,
    ],
  })
}

export interface CommitteeMemberService {
  getCommitteeMembers(
    query?: CommitteeMemberListQuery,
  ): Promise<CommitteeMemberListResponse>
  getCommitteeMemberById(id: string): Promise<CommitteeMemberDetails>
  createCommitteeMember(
    data: CreateCommitteeMemberRequest,
  ): Promise<CommitteeMemberDetails>
  updateCommitteeMember(
    id: string,
    data: UpdateCommitteeMemberRequest,
  ): Promise<CommitteeMemberDetails>
  deleteCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  activateCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  deactivateCommitteeMember(id: string): Promise<CommitteeMemberDetails>
  demoteCommitteeMemberRole(id: string): Promise<CommitteeMemberDetails>
  promoteCommitteeMemberByResident(resident: ResidentDetails): Promise<void>
}

export const committeeMemberService: CommitteeMemberService = {
  async getCommitteeMembers(query = {}) {
    await waitForMockResponse()

    let members = committeeMemberStore
      .filter((member) => member.removedAt === null)
      .map(toListItem)
    const search = normalizeText(query.search ?? "")

    if (search) {
      members = members.filter((member) =>
        [
          member.fullName,
          member.email,
          member.mobile,
          member.department,
          member.designation,
          ...member.responsibilities,
        ].some((value) => normalizeText(value).includes(search)),
      )
    }

    if (query.department) {
      const department = normalizeText(query.department)
      members = members.filter(
        (member) => normalizeText(member.department) === department,
      )
    }

    if (query.status) {
      members = members.filter((member) => member.status === query.status)
    }

    if (query.responsibility) {
      const responsibility = normalizeText(query.responsibility)
      members = members.filter((member) =>
        member.responsibilities.some(
          (item) => normalizeText(item) === responsibility,
        ),
      )
    }

    members.sort((left, right) => {
      switch (query.sort ?? "newest") {
        case "oldest":
          return Date.parse(left.joinedDate) - Date.parse(right.joinedDate)
        case "name_asc":
          return left.fullName.localeCompare(right.fullName)
        case "name_desc":
          return right.fullName.localeCompare(left.fullName)
        case "department_asc":
          return left.department.localeCompare(right.department)
        case "newest":
        default:
          return Date.parse(right.joinedDate) - Date.parse(left.joinedDate)
      }
    })

    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT)
    const total = members.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(
      normalizePositiveInteger(query.page, DEFAULT_PAGE),
      totalPages,
    )
    const startIndex = (page - 1) * limit

    return {
      items: clone(members.slice(startIndex, startIndex + limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },

  async getCommitteeMemberById(id) {
    await waitForMockResponse()
    return clone(committeeMemberStore[getCommitteeMemberIndex(id.trim())])
  },

  async createCommitteeMember(data) {
    await waitForMockResponse()
    ensureUniqueContact(data.email, data.mobile)

    const now = new Date().toISOString()
    const member: CommitteeMemberDetails = {
      id: `committee-${globalThis.crypto.randomUUID()}`,
      role: "committee_member",
      fullName: data.fullName.trim(),
      email: normalizeText(data.email),
      mobile: data.mobile.trim(),
      profileImageUrl: data.profileImageUrl?.trim() || null,
      department: data.department.trim(),
      designation: data.designation.trim(),
      responsibilities: [...data.responsibilities],
      joinedDate: data.joinedDate,
      status: data.status,
      removedAt: null,
      createdAt: now,
      updatedAt: now,
      assignedComplaints: [],
      assignedBookings: [],
      activityLog: [
        {
          id: `activity-${globalThis.crypto.randomUUID()}`,
          type: "profile",
          title: "Committee member added",
          description: "The Committee Head created this committee member profile.",
          occurredAt: now,
        },
      ],
    }

    committeeMemberStore = [member, ...committeeMemberStore]
    return clone(member)
  },

  async updateCommitteeMember(id, data) {
    await waitForMockResponse()
    const index = getCommitteeMemberIndex(id.trim())
    const current = committeeMemberStore[index]
    const email = data.email ? normalizeText(data.email) : current.email
    const mobile = data.mobile?.trim() ?? current.mobile
    ensureUniqueContact(email, mobile, current.id)

    const now = new Date().toISOString()
    return replaceCommitteeMember(index, {
      ...current,
      fullName: data.fullName?.trim() ?? current.fullName,
      email,
      mobile,
      profileImageUrl:
        data.profileImageUrl === undefined
          ? current.profileImageUrl
          : data.profileImageUrl.trim() || null,
      department: data.department?.trim() ?? current.department,
      designation: data.designation?.trim() ?? current.designation,
      responsibilities: data.responsibilities
        ? [...data.responsibilities]
        : current.responsibilities,
      joinedDate: data.joinedDate ?? current.joinedDate,
      status: data.status ?? current.status,
      updatedAt: now,
      activityLog: [
        {
          id: `activity-${globalThis.crypto.randomUUID()}`,
          type: "profile",
          title: "Profile updated",
          description: "Committee member information and responsibilities were updated.",
          occurredAt: now,
        },
        ...current.activityLog,
      ],
    })
  },

  async deleteCommitteeMember(id) {
    await waitForMockResponse()
    const index = getCommitteeMemberIndex(id.trim())
    const current = committeeMemberStore[index]
    const now = new Date().toISOString()

    return replaceCommitteeMember(index, {
      ...current,
      status: "inactive",
      removedAt: now,
      updatedAt: now,
      activityLog: [
        {
          id: `activity-${globalThis.crypto.randomUUID()}`,
          type: "status",
          title: "Committee member removed",
          description: "The member was removed from the active committee roster.",
          occurredAt: now,
        },
        ...current.activityLog,
      ],
    })
  },

  activateCommitteeMember: (id) => updateStatus(id, "active"),
  deactivateCommitteeMember: (id) => updateStatus(id, "inactive"),
  async demoteCommitteeMemberRole(id) {
    await waitForMockResponse()
    const index = getCommitteeMemberIndex(id)
    const member = committeeMemberStore[index]
    const now = new Date().toISOString()
    const updated = {
      ...member,
      role: "resident" as unknown as "committee_member",
      removedAt: now,
      status: "inactive",
      updatedAt: now,
    }
    committeeMemberStore[index] = updated

    const { residentService } = await import("@/features/residents/services/resident.service")
    await residentService.demoteResidentRoleByEmail(member.email)

    return clone(updated)
  },
  async promoteCommitteeMemberByResident(resident) {
    const emailNormalized = normalizeText(resident.email)
    const exists = committeeMemberStore.some(
      (m) => normalizeText(m.email) === emailNormalized && m.removedAt === null
    )
    if (!exists) {
      const now = new Date().toISOString()
      committeeMemberStore.unshift({
        id: `committee-${globalThis.crypto.randomUUID()}`,
        role: "committee_member",
        fullName: resident.fullName,
        email: resident.email,
        mobile: resident.mobile,
        profileImageUrl: resident.profileImageUrl,
        department: "Administration",
        designation: "Committee Member",
        responsibilities: ["Manage Residents"],
        joinedDate: now.split("T")[0],
        status: "active",
        removedAt: null,
        createdAt: now,
        updatedAt: now,
        assignedComplaints: [],
        assignedBookings: [],
        activityLog: [
          {
            id: `activity-${globalThis.crypto.randomUUID()}`,
            type: "profile",
            title: "Appointed to Committee",
            description: "Appointed to the committee by the Committee Head.",
            occurredAt: now,
          },
        ],
      })
    }
  },
}
