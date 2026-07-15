import {
  flatOptions,
  mockResidentDetails,
  towerOptions,
} from "@/features/residents/data/residents.mock"
import type {
  CreateResidentRequest,
  EmergencyContact,
  ResidentAccountStatus,
  ResidentApprovalStatus,
  ResidentDetails,
  ResidentFlat,
  ResidentListItem,
  ResidentListQuery,
  ResidentListResponse,
  UpdateResidentRequest,
} from "@/features/residents/types/resident.types"

const MOCK_DELAY_MS = 250
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

const clone = <T>(value: T): T => structuredClone(value)

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, MOCK_DELAY_MS)
  })

let residentStore: ResidentDetails[] = clone(mockResidentDetails)

const normalizeText = (value: string) => value.trim().toLocaleLowerCase()

const normalizePositiveInteger = (value: number | undefined, fallback: number) => {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

const getResidentIndex = (id: string) => {
  const index = residentStore.findIndex((resident) => resident.id === id)
  if (index === -1) throw new Error("Resident not found")
  return index
}

const toListItem = (resident: ResidentDetails): ResidentListItem => ({
  id: resident.id,
  role: resident.role,
  fullName: resident.fullName,
  email: resident.email,
  mobile: resident.mobile,
  dateOfBirth: resident.dateOfBirth,
  profileImageUrl: resident.profileImageUrl,
  tower: resident.tower,
  flat: resident.flat,
  ownershipType: resident.ownershipType,
  approvalStatus: resident.approvalStatus,
  accountStatus: resident.accountStatus,
  moveInDate: resident.moveInDate,
  emergencyContact: resident.emergencyContact,
  familyMemberCount: resident.familyMemberCount,
  vehicleCount: resident.vehicleCount,
  notes: resident.notes,
  joinedAt: resident.joinedAt,
  createdAt: resident.createdAt,
  updatedAt: resident.updatedAt,
})

const resolveResidence = (
  towerId: string,
  flatNumber: string,
  floor: number,
): { tower: ResidentDetails["tower"]; flat: ResidentFlat } => {
  const tower = towerOptions.find((option) => option.id === towerId)
  if (!tower) throw new Error("Select a valid tower")

  const normalizedFlatNumber = flatNumber.trim()
  const configuredFlat = flatOptions.find(
    (option) =>
      option.towerId === towerId &&
      normalizeText(option.number) === normalizeText(normalizedFlatNumber),
  )

  const flat: ResidentFlat = configuredFlat ?? {
    id: `flat-${towerId}-${normalizeText(normalizedFlatNumber).replace(/[^a-z0-9]+/g, "-")}`,
    towerId,
    number: normalizedFlatNumber,
    floor,
  }

  return { tower, flat: { ...flat, floor } }
}

const buildEmergencyContact = (
  data: CreateResidentRequest | UpdateResidentRequest,
  current: EmergencyContact | null = null,
): EmergencyContact | null => {
  const name = data.emergencyContactName?.trim() ?? current?.name ?? ""
  const mobile = data.emergencyContactNumber?.trim() ?? current?.mobile ?? ""
  const relationship =
    data.emergencyContactRelationship?.trim() ?? current?.relationship ?? ""

  if (!name && !mobile && !relationship) return null
  return { name, mobile, relationship }
}

const ensureUniqueContact = (
  email: string,
  mobile: string,
  excludedResidentId?: string,
) => {
  const normalizedEmail = normalizeText(email)
  const normalizedMobile = mobile.trim()
  const duplicate = residentStore.find(
    (resident) =>
      resident.id !== excludedResidentId &&
      (normalizeText(resident.email) === normalizedEmail || resident.mobile === normalizedMobile),
  )

  if (!duplicate) return
  if (normalizeText(duplicate.email) === normalizedEmail) {
    throw new Error("A resident with this email already exists")
  }
  throw new Error("A resident with this mobile number already exists")
}

const replaceResident = (index: number, resident: ResidentDetails) => {
  residentStore[index] = resident
  return clone(resident)
}

const updateApprovalStatus = async (
  id: string,
  expectedStatus: ResidentApprovalStatus,
  approvalStatus: ResidentApprovalStatus,
) => {
  await waitForMockResponse()
  const index = getResidentIndex(id)
  const resident = residentStore[index]

  if (resident.approvalStatus !== expectedStatus) {
    throw new Error(`Only ${expectedStatus} residents can be ${approvalStatus}`)
  }

  const accountStatus: ResidentAccountStatus =
    approvalStatus === "approved" ? "active" : "inactive"

  return replaceResident(index, {
    ...resident,
    approvalStatus,
    accountStatus,
    updatedAt: new Date().toISOString(),
  })
}

const updateAccountStatus = async (
  id: string,
  allowedCurrentStatuses: ResidentAccountStatus[],
  accountStatus: ResidentAccountStatus,
) => {
  await waitForMockResponse()
  const index = getResidentIndex(id)
  const resident = residentStore[index]

  if (resident.approvalStatus !== "approved") {
    throw new Error("Only approved residents can change account status")
  }

  if (!allowedCurrentStatuses.includes(resident.accountStatus)) {
    throw new Error(`This resident account cannot be changed to ${accountStatus}`)
  }

  return replaceResident(index, {
    ...resident,
    accountStatus,
    updatedAt: new Date().toISOString(),
  })
}

export interface ResidentService {
  getResidents(query?: ResidentListQuery): Promise<ResidentListResponse>
  getResidentById(id: string): Promise<ResidentDetails>
  createResident(data: CreateResidentRequest): Promise<ResidentDetails>
  updateResident(id: string, data: UpdateResidentRequest): Promise<ResidentDetails>
  approveResident(id: string): Promise<ResidentDetails>
  rejectResident(id: string): Promise<ResidentDetails>
  activateResident(id: string): Promise<ResidentDetails>
  deactivateResident(id: string): Promise<ResidentDetails>
  blockResident(id: string): Promise<ResidentDetails>
  unblockResident(id: string): Promise<ResidentDetails>
  promoteResidentRole(id: string): Promise<ResidentDetails>
  demoteResidentRoleByEmail(email: string): Promise<void>
  removeResident(id: string): Promise<ResidentDetails>
}

export const residentService: ResidentService = {
  async getResidents(query = {}) {
    await waitForMockResponse()

    let residents = residentStore.map(toListItem)
    const search = normalizeText(query.search ?? "")

    if (search) {
      residents = residents.filter((resident) =>
        [
          resident.fullName,
          resident.email,
          resident.mobile,
          resident.tower.name,
          resident.flat.number,
        ].some((value) => normalizeText(value).includes(search)),
      )
    }

    if (query.approvalStatus) {
      residents = residents.filter(
        (resident) => resident.approvalStatus === query.approvalStatus,
      )
    }

    if (query.accountStatus) {
      residents = residents.filter(
        (resident) => resident.accountStatus === query.accountStatus,
      )
    }

    if (query.ownershipType) {
      residents = residents.filter(
        (resident) => resident.ownershipType === query.ownershipType,
      )
    }

    if (query.tower) {
      const tower = normalizeText(query.tower)
      residents = residents.filter((resident) => {
        const towerName = normalizeText(resident.tower.name)
        return (
          normalizeText(resident.tower.id) === tower ||
          towerName === tower ||
          towerName.endsWith(` ${tower}`)
        )
      })
    }

    residents.sort((left, right) => {
      switch (query.sort ?? "newest") {
        case "oldest":
          return Date.parse(left.joinedAt) - Date.parse(right.joinedAt)
        case "name_asc":
          return left.fullName.localeCompare(right.fullName)
        case "name_desc":
          return right.fullName.localeCompare(left.fullName)
        case "tower_asc":
          return left.tower.name.localeCompare(right.tower.name, undefined, { numeric: true })
        case "flat_asc":
          return left.flat.number.localeCompare(right.flat.number, undefined, { numeric: true })
        case "newest":
        default:
          return Date.parse(right.joinedAt) - Date.parse(left.joinedAt)
      }
    })

    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT)
    const total = residents.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(normalizePositiveInteger(query.page, DEFAULT_PAGE), totalPages)
    const startIndex = (page - 1) * limit

    return {
      items: clone(residents.slice(startIndex, startIndex + limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },

  async getResidentById(id) {
    await waitForMockResponse()
    const resident = residentStore[getResidentIndex(id.trim())]
    return clone(resident)
  },

  async createResident(data) {
    await waitForMockResponse()
    ensureUniqueContact(data.email, data.mobile)

    const { tower, flat } = resolveResidence(data.towerId, data.flatNumber, data.floor)
    const now = new Date().toISOString()
    const resident: ResidentDetails = {
      id: `resident-${globalThis.crypto.randomUUID()}`,
      role: "resident",
      fullName: data.fullName.trim(),
      email: data.email.trim().toLocaleLowerCase(),
      mobile: data.mobile.trim(),
      dateOfBirth: data.dateOfBirth?.trim() || null,
      profileImageUrl: data.profileImageUrl?.trim() || null,
      tower,
      flat,
      ownershipType: data.ownershipType,
      approvalStatus: "pending",
      accountStatus: "inactive",
      moveInDate: data.moveInDate,
      emergencyContact: buildEmergencyContact(data),
      familyMemberCount: data.familyMemberCount,
      vehicleCount: data.vehicleCount,
      notes: data.notes?.trim() ?? "",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
      familyMembers: [],
      vehicles: [],
      maintenance: {
        outstandingAmount: 0,
        currentMonthCharge: 0,
        totalPaidThisFinancialYear: 0,
        lastPaymentAmount: null,
        lastPaymentDate: null,
        nextDueDate: null,
      },
      complaintSummary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
      visitorHistory: [],
    }

    residentStore = [resident, ...residentStore]

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      "New resident registration",
      `${data.fullName} registered for Flat ${flat.number} (${tower.name}) and is pending approval.`,
      "system",
      `/residents`,
      "Review resident"
    )

    return clone(resident)
  },

  async updateResident(id, data) {
    await waitForMockResponse()
    const index = getResidentIndex(id.trim())
    const current = residentStore[index]
    const email = data.email?.trim().toLocaleLowerCase() ?? current.email
    const mobile = data.mobile?.trim() ?? current.mobile
    ensureUniqueContact(email, mobile, current.id)

    const { tower, flat } = resolveResidence(
      data.towerId ?? current.tower.id,
      data.flatNumber ?? current.flat.number,
      data.floor ?? current.flat.floor,
    )

    return replaceResident(index, {
      ...current,
      fullName: data.fullName?.trim() ?? current.fullName,
      email,
      mobile,
      dateOfBirth:
        data.dateOfBirth === undefined ? current.dateOfBirth : data.dateOfBirth.trim() || null,
      profileImageUrl:
        data.profileImageUrl === undefined
          ? current.profileImageUrl
          : data.profileImageUrl.trim() || null,
      tower,
      flat,
      ownershipType: data.ownershipType ?? current.ownershipType,
      moveInDate: data.moveInDate ?? current.moveInDate,
      emergencyContact: buildEmergencyContact(data, current.emergencyContact),
      familyMemberCount: data.familyMemberCount ?? current.familyMemberCount,
      vehicleCount: data.vehicleCount ?? current.vehicleCount,
      notes: data.notes === undefined ? current.notes : data.notes.trim(),
      updatedAt: new Date().toISOString(),
    })
  },

  async approveResident(id) {
    const res = await updateApprovalStatus(id, "pending", "approved")

    const { notificationService } = await import("@/features/notifications/services/notification.service")
    await notificationService.add(
      "Resident approved",
      `The registration request for ${res.fullName} (Flat ${res.flat.number}) has been approved.`,
      "system",
      `/residents`,
      "View resident"
    )

    return res
  },
  rejectResident: (id) => updateApprovalStatus(id, "pending", "rejected"),
  activateResident: (id) => updateAccountStatus(id, ["inactive"], "active"),
  deactivateResident: (id) => updateAccountStatus(id, ["active"], "inactive"),
  blockResident: (id) => updateAccountStatus(id, ["active", "inactive"], "blocked"),
  unblockResident: (id) => updateAccountStatus(id, ["blocked"], "active"),
  async promoteResidentRole(id) {
    await waitForMockResponse()
    const index = getResidentIndex(id)
    const resident = residentStore[index]

    const updated = {
      ...resident,
      role: "committee_member" as any,
      updatedAt: new Date().toISOString(),
    }
    residentStore[index] = updated

    const { committeeMemberService } = await import("@/features/committee-members/services/committee-member.service")
    await committeeMemberService.promoteCommitteeMemberByResident(resident)

    return clone(updated)
  },
  async demoteResidentRoleByEmail(email) {
    const emailNormalized = normalizeText(email)
    const index = residentStore.findIndex((r) => normalizeText(r.email) === emailNormalized)
    if (index >= 0) {
      residentStore[index] = {
        ...residentStore[index],
        role: "resident" as any,
        updatedAt: new Date().toISOString(),
      }
    }
  },
  async removeResident(id) {
    await waitForMockResponse()
    const index = getResidentIndex(id)
    const resident = residentStore[index]
    residentStore.splice(index, 1)
    return clone(resident)
  },
}
