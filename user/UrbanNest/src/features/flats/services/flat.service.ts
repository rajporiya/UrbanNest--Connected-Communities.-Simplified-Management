import {
  flatTowerOptions,
  mockFlatDetails,
} from "@/features/flats/data/flats.mock"
import type {
  CreateFlatRequest,
  Flat,
  FlatDetails,
  FlatListQuery,
  FlatListResponse,
  FlatOccupancyStatus,
  UpdateFlatRequest,
} from "@/features/flats/types/flat.types"

const MOCK_DELAY_MS = 220
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

const clone = <T>(value: T): T => structuredClone(value)

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, MOCK_DELAY_MS)
  })

let flatStore: FlatDetails[] = clone(mockFlatDetails)

const normalizeText = (value: string) => value.trim().toLocaleLowerCase()

const normalizePositiveInteger = (value: number | undefined, fallback: number) => {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.trunc(value))
}

const getFlatIndex = (id: string) => {
  const index = flatStore.findIndex((flat) => flat.id === id)
  if (index === -1) throw new Error("Flat not found")
  return index
}

const getTower = (towerId: string) => {
  const tower = flatTowerOptions.find((item) => item.id === towerId)
  if (!tower) throw new Error("Select a valid tower")
  return tower
}

const validateFloor = (floorNumber: number, totalFloors: number) => {
  if (!Number.isInteger(floorNumber) || floorNumber < 0) {
    throw new Error("Floor must be a non-negative whole number")
  }
  if (floorNumber > totalFloors) {
    throw new Error(`The selected tower has only ${totalFloors} floors`)
  }
}

const ensureUniqueFlatNumber = (
  towerId: string,
  flatNumber: string,
  excludedFlatId?: string,
) => {
  const normalizedNumber = normalizeText(flatNumber)
  const duplicate = flatStore.some(
    (flat) =>
      flat.id !== excludedFlatId &&
      flat.tower.id === towerId &&
      normalizeText(flat.flatNumber) === normalizedNumber,
  )
  if (duplicate) throw new Error("This flat number already exists in the selected tower")
}

const resolveOwnerName = (
  status: FlatOccupancyStatus,
  ownerName: string | null | undefined,
) => {
  const normalizedOwner = ownerName?.trim() || null
  if (status === "occupied" && !normalizedOwner) {
    throw new Error("Owner name is required for an occupied flat")
  }
  return status === "vacant" ? null : normalizedOwner
}

export interface FlatService {
  getFlats(query?: FlatListQuery): Promise<FlatListResponse>
  getFlatById(id: string): Promise<FlatDetails>
  createFlat(data: CreateFlatRequest): Promise<FlatDetails>
  updateFlat(id: string, data: UpdateFlatRequest): Promise<FlatDetails>
  deleteFlat(id: string): Promise<void>
}

export const flatService: FlatService = {
  async getFlats(query = {}) {
    await waitForMockResponse()

    let flats: Flat[] = flatStore.map((flat) => clone(flat))
    const search = normalizeText(query.search ?? "")

    if (search) {
      flats = flats.filter((flat) =>
        [
          flat.tower.name,
          flat.flatNumber,
          flat.ownerName ?? "",
          flat.bhkType,
          String(flat.floorNumber),
        ].some((value) => normalizeText(value).includes(search)),
      )
    }
    if (query.towerId) flats = flats.filter((flat) => flat.tower.id === query.towerId)
    if (query.floorNumber !== undefined) {
      flats = flats.filter((flat) => flat.floorNumber === query.floorNumber)
    }
    if (query.bhkType) flats = flats.filter((flat) => flat.bhkType === query.bhkType)
    if (query.occupancyStatus) {
      flats = flats.filter((flat) => flat.occupancyStatus === query.occupancyStatus)
    }

    flats.sort((left, right) => {
      switch (query.sort ?? "tower_asc") {
        case "flat_asc":
          return left.flatNumber.localeCompare(right.flatNumber, undefined, { numeric: true })
        case "flat_desc":
          return right.flatNumber.localeCompare(left.flatNumber, undefined, { numeric: true })
        case "floor_asc":
          return left.floorNumber - right.floorNumber || left.flatNumber.localeCompare(right.flatNumber, undefined, { numeric: true })
        case "area_asc":
          return left.areaSqFt - right.areaSqFt
        case "area_desc":
          return right.areaSqFt - left.areaSqFt
        case "newest":
          return Date.parse(right.createdAt) - Date.parse(left.createdAt)
        case "tower_asc":
        default:
          return left.tower.name.localeCompare(right.tower.name, undefined, { numeric: true }) ||
            left.flatNumber.localeCompare(right.flatNumber, undefined, { numeric: true })
      }
    })

    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT)
    const total = flats.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(normalizePositiveInteger(query.page, DEFAULT_PAGE), totalPages)
    const startIndex = (page - 1) * limit

    return {
      items: clone(flats.slice(startIndex, startIndex + limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },

  async getFlatById(id) {
    await waitForMockResponse()
    return clone(flatStore[getFlatIndex(id.trim())])
  },

  async createFlat(data) {
    await waitForMockResponse()
    const tower = getTower(data.towerId)
    validateFloor(data.floorNumber, tower.totalFloors)
    const flatNumber = data.flatNumber.trim().toLocaleUpperCase()
    ensureUniqueFlatNumber(tower.id, flatNumber)
    const now = new Date().toISOString()
    const flat: FlatDetails = {
      id: `flat-${globalThis.crypto.randomUUID()}`,
      tower: clone(tower),
      floorNumber: data.floorNumber,
      flatNumber,
      bhkType: data.bhkType,
      areaSqFt: data.areaSqFt,
      ownerName: resolveOwnerName(data.occupancyStatus, data.ownerName),
      occupancyStatus: data.occupancyStatus,
      createdAt: now,
      updatedAt: now,
    }
    flatStore = [flat, ...flatStore]
    return clone(flat)
  },

  async updateFlat(id, data) {
    await waitForMockResponse()
    const index = getFlatIndex(id.trim())
    const current = flatStore[index]
    const tower = data.towerId ? getTower(data.towerId) : current.tower
    const floorNumber = data.floorNumber ?? current.floorNumber
    validateFloor(floorNumber, tower.totalFloors)
    const flatNumber = data.flatNumber?.trim().toLocaleUpperCase() ?? current.flatNumber
    ensureUniqueFlatNumber(tower.id, flatNumber, current.id)
    const occupancyStatus = data.occupancyStatus ?? current.occupancyStatus
    const ownerCandidate = data.ownerName === undefined ? current.ownerName : data.ownerName

    const updated: FlatDetails = {
      ...current,
      tower: clone(tower),
      floorNumber,
      flatNumber,
      bhkType: data.bhkType ?? current.bhkType,
      areaSqFt: data.areaSqFt ?? current.areaSqFt,
      ownerName: resolveOwnerName(occupancyStatus, ownerCandidate),
      occupancyStatus,
      updatedAt: new Date().toISOString(),
    }
    flatStore[index] = updated
    return clone(updated)
  },

  async deleteFlat(id) {
    await waitForMockResponse()
    flatStore.splice(getFlatIndex(id.trim()), 1)
  },
}
