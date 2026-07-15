export type FlatOccupancyStatus = "occupied" | "vacant" | "reserved"

export type FlatBhkType =
  | "Studio"
  | "1 BHK"
  | "2 BHK"
  | "3 BHK"
  | "4 BHK"
  | "Penthouse"

export type FlatSortOption =
  | "tower_asc"
  | "flat_asc"
  | "flat_desc"
  | "floor_asc"
  | "area_asc"
  | "area_desc"
  | "newest"

export interface FlatTower {
  id: string
  name: string
  totalFloors: number
}

export interface Flat {
  id: string
  tower: FlatTower
  floorNumber: number
  flatNumber: string
  bhkType: FlatBhkType
  areaSqFt: number
  ownerName: string | null
  occupancyStatus: FlatOccupancyStatus
  createdAt: string
  updatedAt: string
}

export type FlatListItem = Flat
export type FlatDetails = Flat

export interface CreateFlatRequest {
  towerId: string
  floorNumber: number
  flatNumber: string
  bhkType: FlatBhkType
  areaSqFt: number
  ownerName: string
  occupancyStatus: FlatOccupancyStatus
}

export type UpdateFlatRequest = Partial<CreateFlatRequest>

export interface FlatListQuery {
  page?: number
  limit?: number
  search?: string
  towerId?: string
  floorNumber?: number
  bhkType?: FlatBhkType
  occupancyStatus?: FlatOccupancyStatus
  sort?: FlatSortOption
}

export interface FlatListResponse {
  items: FlatListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
