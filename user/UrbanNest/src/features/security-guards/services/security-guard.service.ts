import {
  mockSecurityGuardDetails,
  shiftOptions,
} from "@/features/security-guards/data/security-guards.mock"
import type {
  CreateSecurityGuardRequest,
  GuardShift,
  GuardStatus,
  SecurityGuardDetails,
  SecurityGuardListItem,
  SecurityGuardListQuery,
  SecurityGuardListResponse,
  UpdateSecurityGuardRequest,
} from "@/features/security-guards/types/security-guard.types"

const MOCK_DELAY_MS = 250
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

const clone = <T>(value: T): T => structuredClone(value)

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, MOCK_DELAY_MS)
  })

let securityGuardStore: SecurityGuardDetails[] = clone(mockSecurityGuardDetails)

const normalizeText = (value: string) => value.trim().toLocaleLowerCase()

const normalizePositiveInteger = (value: number | undefined, fallback: number) => {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const getSecurityGuardIndex = (id: string) => {
  const index = securityGuardStore.findIndex((guard) => guard.id === id)
  if (index === -1) throw new Error("Security guard not found")
  return index
}

const toListItem = (guard: SecurityGuardDetails): SecurityGuardListItem => ({
  id: guard.id,
  role: guard.role,
  fullName: guard.fullName,
  email: guard.email,
  mobile: guard.mobile,
  employeeId: guard.employeeId,
  profileImageUrl: guard.profileImageUrl,
  gate: guard.gate,
  shift: guard.shift,
  joiningDate: guard.joiningDate,
  emergencyContact: guard.emergencyContact,
  status: guard.status,
  createdAt: guard.createdAt,
  updatedAt: guard.updatedAt,
})

const ensureUniqueIdentity = (
  email: string,
  mobile: string,
  employeeId: string,
  excludedGuardId?: string,
) => {
  const normalizedEmail = normalizeText(email)
  const normalizedMobile = mobile.trim()
  const normalizedEmployeeId = normalizeText(employeeId)
  const guards = securityGuardStore.filter((guard) => guard.id !== excludedGuardId)

  if (guards.some((guard) => normalizeText(guard.email) === normalizedEmail)) {
    throw new Error("A security guard with this email already exists")
  }

  if (guards.some((guard) => guard.mobile === normalizedMobile)) {
    throw new Error("A security guard with this mobile number already exists")
  }

  if (guards.some((guard) => normalizeText(guard.employeeId) === normalizedEmployeeId)) {
    throw new Error("A security guard with this employee ID already exists")
  }
}

const getConfiguredShift = (name: GuardShift["name"]): GuardShift => {
  const shift = shiftOptions.find((option) => option.name === name)
  if (!shift) throw new Error("Select a valid shift")
  return shift
}

const buildShift = (
  data: CreateSecurityGuardRequest | UpdateSecurityGuardRequest,
  current?: GuardShift,
): GuardShift => {
  const name = data.shiftName ?? current?.name ?? "Morning"
  const configuredShift = getConfiguredShift(name)
  const changedShift = current !== undefined && current.name !== name

  return {
    name,
    startTime:
      data.shiftStartTime ??
      (changedShift ? configuredShift.startTime : current?.startTime) ??
      configuredShift.startTime,
    endTime:
      data.shiftEndTime ??
      (changedShift ? configuredShift.endTime : current?.endTime) ??
      configuredShift.endTime,
  }
}

const replaceSecurityGuard = (index: number, guard: SecurityGuardDetails) => {
  securityGuardStore[index] = guard
  return clone(guard)
}

const updateStatus = async (id: string, status: GuardStatus) => {
  await waitForMockResponse()
  const index = getSecurityGuardIndex(id.trim())
  const guard = securityGuardStore[index]

  if (guard.status === status) return clone(guard)

  return replaceSecurityGuard(index, {
    ...guard,
    status,
    updatedAt: new Date().toISOString(),
  })
}

export interface SecurityGuardService {
  getSecurityGuards(query?: SecurityGuardListQuery): Promise<SecurityGuardListResponse>
  getSecurityGuardById(id: string): Promise<SecurityGuardDetails>
  createSecurityGuard(data: CreateSecurityGuardRequest): Promise<SecurityGuardDetails>
  updateSecurityGuard(
    id: string,
    data: UpdateSecurityGuardRequest,
  ): Promise<SecurityGuardDetails>
  deleteSecurityGuard(id: string): Promise<void>
  activateSecurityGuard(id: string): Promise<SecurityGuardDetails>
  deactivateSecurityGuard(id: string): Promise<SecurityGuardDetails>
}

export const securityGuardService: SecurityGuardService = {
  async getSecurityGuards(query = {}) {
    await waitForMockResponse()

    let guards = securityGuardStore.map(toListItem)
    const search = normalizeText(query.search ?? "")

    if (search) {
      guards = guards.filter((guard) =>
        [
          guard.fullName,
          guard.email,
          guard.mobile,
          guard.employeeId,
          guard.gate,
          guard.shift.name,
        ].some((value) => normalizeText(value).includes(search)),
      )
    }

    if (query.gate) {
      guards = guards.filter((guard) => guard.gate === query.gate)
    }

    if (query.shift) {
      guards = guards.filter((guard) => guard.shift.name === query.shift)
    }

    if (query.status) {
      guards = guards.filter((guard) => guard.status === query.status)
    }

    guards.sort((left, right) => {
      switch (query.sort ?? "newest") {
        case "oldest":
          return Date.parse(left.joiningDate) - Date.parse(right.joiningDate)
        case "name_asc":
          return left.fullName.localeCompare(right.fullName)
        case "name_desc":
          return right.fullName.localeCompare(left.fullName)
        case "employee_id_asc":
          return left.employeeId.localeCompare(right.employeeId, undefined, { numeric: true })
        case "gate_asc":
          return left.gate.localeCompare(right.gate, undefined, { numeric: true })
        case "shift_asc":
          return left.shift.startTime.localeCompare(right.shift.startTime)
        case "newest":
        default:
          return Date.parse(right.joiningDate) - Date.parse(left.joiningDate)
      }
    })

    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT)
    const total = guards.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(normalizePositiveInteger(query.page, DEFAULT_PAGE), totalPages)
    const startIndex = (page - 1) * limit

    return {
      items: clone(guards.slice(startIndex, startIndex + limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },

  async getSecurityGuardById(id) {
    await waitForMockResponse()
    const guard = securityGuardStore[getSecurityGuardIndex(id.trim())]
    return clone(guard)
  },

  async createSecurityGuard(data) {
    await waitForMockResponse()

    const email = data.email.trim().toLocaleLowerCase()
    const mobile = data.mobile.trim()
    const employeeId = data.employeeId.trim().toLocaleUpperCase()
    ensureUniqueIdentity(email, mobile, employeeId)

    const now = new Date().toISOString()
    const guard: SecurityGuardDetails = {
      id: `guard-${globalThis.crypto.randomUUID()}`,
      role: "security_guard",
      fullName: data.fullName.trim(),
      email,
      mobile,
      employeeId,
      profileImageUrl: data.profileImageUrl?.trim() || null,
      gate: data.gate,
      shift: buildShift(data),
      joiningDate: data.joiningDate,
      emergencyContact: {
        name: data.emergencyContactName.trim(),
        mobile: data.emergencyContactNumber.trim(),
        relationship: data.emergencyContactRelationship.trim(),
      },
      status: data.status,
      createdAt: now,
      updatedAt: now,
      visitorHistory: [],
      shiftHistory: [
        {
          id: `guard-shift-history-${globalThis.crypto.randomUUID()}`,
          guardId: "",
          gate: data.gate,
          shift: buildShift(data),
          assignedFrom: data.joiningDate,
          assignedUntil: null,
          changeReason: "Initial assignment",
        },
      ],
      attendance: [],
    }
    guard.shiftHistory[0].guardId = guard.id

    securityGuardStore = [guard, ...securityGuardStore]
    return clone(guard)
  },

  async updateSecurityGuard(id, data) {
    await waitForMockResponse()

    const index = getSecurityGuardIndex(id.trim())
    const current = securityGuardStore[index]
    const email = data.email?.trim().toLocaleLowerCase() ?? current.email
    const mobile = data.mobile?.trim() ?? current.mobile
    const employeeId =
      data.employeeId?.trim().toLocaleUpperCase() ?? current.employeeId
    ensureUniqueIdentity(email, mobile, employeeId, current.id)

    const gate = data.gate ?? current.gate
    const shift = buildShift(data, current.shift)
    const assignmentChanged =
      gate !== current.gate ||
      shift.name !== current.shift.name ||
      shift.startTime !== current.shift.startTime ||
      shift.endTime !== current.shift.endTime
    const today = getToday()
    const shiftHistory = assignmentChanged
      ? [
          ...current.shiftHistory.map((item) =>
            item.assignedUntil === null ? { ...item, assignedUntil: today } : item,
          ),
          {
            id: `guard-shift-history-${globalThis.crypto.randomUUID()}`,
            guardId: current.id,
            gate,
            shift,
            assignedFrom: today,
            assignedUntil: null,
            changeReason: "Assignment updated by committee head",
          },
        ]
      : current.shiftHistory

    return replaceSecurityGuard(index, {
      ...current,
      fullName: data.fullName?.trim() ?? current.fullName,
      email,
      mobile,
      employeeId,
      profileImageUrl:
        data.profileImageUrl === undefined
          ? current.profileImageUrl
          : data.profileImageUrl.trim() || null,
      gate,
      shift,
      joiningDate: data.joiningDate ?? current.joiningDate,
      emergencyContact: {
        name: data.emergencyContactName?.trim() ?? current.emergencyContact.name,
        mobile:
          data.emergencyContactNumber?.trim() ?? current.emergencyContact.mobile,
        relationship:
          data.emergencyContactRelationship?.trim() ??
          current.emergencyContact.relationship,
      },
      status: data.status ?? current.status,
      updatedAt: new Date().toISOString(),
      shiftHistory,
    })
  },

  async deleteSecurityGuard(id) {
    await waitForMockResponse()
    const index = getSecurityGuardIndex(id.trim())
    securityGuardStore.splice(index, 1)
  },

  activateSecurityGuard: (id) => updateStatus(id, "active"),
  deactivateSecurityGuard: (id) => updateStatus(id, "inactive"),
}
