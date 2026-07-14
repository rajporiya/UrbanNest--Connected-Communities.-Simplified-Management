import { mockTowers } from "@/features/towers/data/towers.mock"
import type {
  CreateTowerRequest,
  Tower,
  TowerDetails,
  TowerListQuery,
  TowerListResponse,
  UpdateTowerRequest,
} from "@/features/towers/types/tower.types"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MOCK_DELAY_MS = 250

let towerStore: Tower[] = structuredClone(mockTowers)

const clone = <T,>(value: T): T => structuredClone(value)

const normalizeText = (value: string) => value.trim().toLocaleLowerCase()

const normalizeTowerName = (value: string) => value.trim().replace(/\s+/g, " ")

const normalizePositiveInteger = (value: number | undefined, fallback: number) =>
  Number.isInteger(value) && (value ?? 0) > 0 ? (value as number) : fallback

const waitForMockResponse = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS)
  })

function getTowerIndex(id: string) {
  const index = towerStore.findIndex((tower) => tower.id === id)

  if (index < 0) {
    throw new Error("Tower not found")
  }

  return index
}

function ensureUniqueName(name: string, excludedId?: string) {
  const normalizedName = normalizeText(normalizeTowerName(name))
  const duplicate = towerStore.some(
    (tower) =>
      tower.id !== excludedId && normalizeText(tower.name) === normalizedName,
  )

  if (duplicate) {
    throw new Error("A tower with this name already exists")
  }
}

function replaceTower(index: number, tower: Tower) {
  towerStore[index] = tower
  return clone(tower)
}

function sortTowers(towers: Tower[], sort: TowerListQuery["sort"]) {
  towers.sort((left, right) => {
    switch (sort ?? "name_asc") {
      case "name_desc":
        return right.name.localeCompare(left.name, undefined, { numeric: true })
      case "floors_asc":
        return left.numberOfFloors - right.numberOfFloors
      case "floors_desc":
        return right.numberOfFloors - left.numberOfFloors
      case "flats_asc":
        return left.totalFlats - right.totalFlats
      case "flats_desc":
        return right.totalFlats - left.totalFlats
      case "newest":
        return Date.parse(right.createdAt) - Date.parse(left.createdAt)
      case "oldest":
        return Date.parse(left.createdAt) - Date.parse(right.createdAt)
      case "name_asc":
      default:
        return left.name.localeCompare(right.name, undefined, { numeric: true })
    }
  })
}

export interface TowerService {
  getTowers(query?: TowerListQuery): Promise<TowerListResponse>
  getTowerById(id: string): Promise<TowerDetails>
  createTower(data: CreateTowerRequest): Promise<TowerDetails>
  updateTower(id: string, data: UpdateTowerRequest): Promise<TowerDetails>
  deleteTower(id: string): Promise<void>
}

export const towerService: TowerService = {
  async getTowers(query = {}) {
    await waitForMockResponse()

    let towers = towerStore.map((tower) => clone(tower))
    const search = normalizeText(query.search ?? "")

    if (search) {
      towers = towers.filter((tower) =>
        [tower.name, tower.description].some((value) =>
          normalizeText(value).includes(search),
        ),
      )
    }

    if (query.status) {
      towers = towers.filter((tower) => tower.status === query.status)
    }

    sortTowers(towers, query.sort)

    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT)
    const total = towers.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(
      normalizePositiveInteger(query.page, DEFAULT_PAGE),
      totalPages,
    )
    const startIndex = (page - 1) * limit

    return {
      items: clone(towers.slice(startIndex, startIndex + limit)),
      total,
      page,
      limit,
      totalPages,
    }
  },

  async getTowerById(id) {
    await waitForMockResponse()
    return clone(towerStore[getTowerIndex(id.trim())])
  },

  async createTower(data) {
    await waitForMockResponse()
    ensureUniqueName(data.name)

    const now = new Date().toISOString()
    const tower: Tower = {
      id: `tower-${globalThis.crypto.randomUUID()}`,
      name: normalizeTowerName(data.name),
      numberOfFloors: data.numberOfFloors,
      totalFlats: data.totalFlats,
      description: data.description.trim(),
      status: data.status,
      createdAt: now,
      updatedAt: now,
    }

    towerStore = [tower, ...towerStore]
    return clone(tower)
  },

  async updateTower(id, data) {
    await waitForMockResponse()
    const normalizedId = id.trim()
    const index = getTowerIndex(normalizedId)
    const current = towerStore[index]

    if (data.name !== undefined) {
      ensureUniqueName(data.name, normalizedId)
    }

    return replaceTower(index, {
      ...current,
      ...data,
      name: data.name ? normalizeTowerName(data.name) : current.name,
      description: data.description?.trim() ?? current.description,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteTower(id) {
    await waitForMockResponse()
    const index = getTowerIndex(id.trim())
    towerStore.splice(index, 1)
  },
}
