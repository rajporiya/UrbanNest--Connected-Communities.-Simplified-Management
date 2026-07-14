import type {
  FlatBhkType,
  FlatDetails,
  FlatOccupancyStatus,
  FlatTower,
} from "@/features/flats/types/flat.types"

export const flatTowerOptions: FlatTower[] = [
  { id: "tower-a", name: "Tower A", totalFloors: 18 },
  { id: "tower-b", name: "Tower B", totalFloors: 20 },
  { id: "tower-c", name: "Tower C", totalFloors: 16 },
  { id: "tower-d", name: "Tower D", totalFloors: 22 },
  { id: "tower-e", name: "Tower E", totalFloors: 14 },
  { id: "tower-f", name: "Tower F", totalFloors: 12 },
  { id: "tower-h", name: "Tower H", totalFloors: 24 },
  { id: "tower-j", name: "Tower J", totalFloors: 15 },
  { id: "tower-k", name: "Tower K", totalFloors: 19 },
]

export const bhkTypeOptions: FlatBhkType[] = [
  "Studio",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "Penthouse",
]

export const occupancyStatusOptions: FlatOccupancyStatus[] = [
  "occupied",
  "vacant",
  "reserved",
]

const getTower = (id: string) => {
  const tower = flatTowerOptions.find((item) => item.id === id)
  if (!tower) throw new Error(`Mock tower ${id} is missing`)
  return tower
}

export const mockFlatDetails: FlatDetails[] = [
  ["flat-a-101", "tower-a", 1, "A-101", "2 BHK", 960, "Aarav Mehta", "occupied", "2025-01-09"],
  ["flat-a-102", "tower-a", 1, "A-102", "1 BHK", 680, null, "vacant", "2025-01-10"],
  ["flat-a-201", "tower-a", 2, "A-201", "3 BHK", 1320, "Diya Shah", "occupied", "2025-01-12"],
  ["flat-a-501", "tower-a", 5, "A-501", "4 BHK", 1850, "Kabir Patel", "reserved", "2025-02-03"],
  ["flat-b-101", "tower-b", 1, "B-101", "2 BHK", 980, "Rohan Iyer", "occupied", "2025-02-14"],
  ["flat-b-202", "tower-b", 2, "B-202", "2 BHK", 995, null, "vacant", "2025-02-20"],
  ["flat-b-704", "tower-b", 7, "B-704", "3 BHK", 1410, "Meera Rao", "occupied", "2025-03-01"],
  ["flat-b-1501", "tower-b", 15, "B-1501", "Penthouse", 3250, "Vihaan Desai", "occupied", "2025-03-10"],
  ["flat-c-g01", "tower-c", 0, "C-G01", "Studio", 510, null, "reserved", "2025-03-18"],
  ["flat-c-302", "tower-c", 3, "C-302", "2 BHK", 920, "Anaya Nair", "occupied", "2025-04-04"],
  ["flat-c-803", "tower-c", 8, "C-803", "3 BHK", 1380, null, "vacant", "2025-04-19"],
  ["flat-d-105", "tower-d", 1, "D-105", "1 BHK", 710, "Ishaan Gupta", "occupied", "2025-05-02"],
  ["flat-d-606", "tower-d", 6, "D-606", "3 BHK", 1450, "Sara Khan", "occupied", "2025-05-18"],
  ["flat-d-1202", "tower-d", 12, "D-1202", "4 BHK", 1975, null, "vacant", "2025-06-08"],
  ["flat-d-1801", "tower-d", 18, "D-1801", "Penthouse", 3480, "Advait Joshi", "reserved", "2025-06-20"],
].map(([id, towerId, floorNumber, flatNumber, bhkType, areaSqFt, ownerName, occupancyStatus, date]) => ({
  id: id as string,
  tower: getTower(towerId as string),
  floorNumber: floorNumber as number,
  flatNumber: flatNumber as string,
  bhkType: bhkType as FlatBhkType,
  areaSqFt: areaSqFt as number,
  ownerName: ownerName as string | null,
  occupancyStatus: occupancyStatus as FlatOccupancyStatus,
  createdAt: `${date as string}T09:30:00.000Z`,
  updatedAt: `${date as string}T09:30:00.000Z`,
}))
