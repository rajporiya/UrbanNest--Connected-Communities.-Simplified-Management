export type TowerStatus = "active" | "inactive"

export type TowerSortOption =
  | "name_asc"
  | "name_desc"
  | "floors_asc"
  | "floors_desc"
  | "flats_asc"
  | "flats_desc"
  | "newest"
  | "oldest"

export interface Tower {
  id: string
  name: string
  numberOfFloors: number
  totalFlats: number
  description: string
  status: TowerStatus
  createdAt: string
  updatedAt: string
}

export type TowerListItem = Tower
export type TowerDetails = Tower

export interface CreateTowerRequest {
  name: string
  numberOfFloors: number
  totalFlats: number
  description: string
  status: TowerStatus
}

export type UpdateTowerRequest = Partial<CreateTowerRequest>

export interface TowerListQuery {
  page?: number
  limit?: number
  search?: string
  status?: TowerStatus
  sort?: TowerSortOption
}

export interface TowerListResponse {
  items: TowerListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
