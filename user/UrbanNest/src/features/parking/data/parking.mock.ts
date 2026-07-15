import type { ParkingAssignment, ParkingSlot, ParkingSlotType, ParkingVehicle } from "@/features/parking/types/parking.types"

export const parkingZones = ["Basement 1", "Basement 2", "Podium", "Open Area"] as const
export const parkingSlotTypes: ParkingSlotType[] = ["Resident", "Guest", "Accessible", "EV"]
export const parkingResidents = [{ id: "resident-1", name: "Aarav Mehta", flat: "A-101" }, { id: "resident-2", name: "Diya Shah", flat: "A-201" }, { id: "resident-3", name: "Rohan Iyer", flat: "B-101" }, { id: "resident-4", name: "Meera Rao", flat: "B-704" }] as const

export const parkingVehiclesMock: ParkingVehicle[] = [
  ["vehicle-1", "resident-1", "Aarav Mehta", "A-101", "GJ01AB1234", "Hyundai", "Creta", "White", "Car"],
  ["vehicle-2", "resident-2", "Diya Shah", "A-201", "GJ01CD5678", "Honda", "Activa", "Blue", "Scooter"],
  ["vehicle-3", "resident-3", "Rohan Iyer", "B-101", "GJ05EF9012", "Tata", "Nexon EV", "Teal", "Car"],
  ["vehicle-4", "resident-4", "Meera Rao", "B-704", "GJ01GH3456", "Royal Enfield", "Classic", "Black", "Motorcycle"],
].map(([id, residentId, residentName, flatNumber, registrationNumber, make, model, color, type]) => ({ id, residentId, residentName, flatNumber, registrationNumber, make, model, color, type: type as ParkingVehicle["type"], active: true, createdAt: "2026-01-10T09:00:00.000Z" }))

const activeAssignments: ParkingAssignment[] = parkingVehiclesMock.slice(0, 3).map((vehicle, index) => ({ id: `assignment-${index + 1}`, slotId: `slot-${index + 1}`, slotNumber: `B1-${String(index + 1).padStart(2, "0")}`, vehicleId: vehicle.id, vehicleNumber: vehicle.registrationNumber, residentId: vehicle.residentId, residentName: vehicle.residentName, flatNumber: vehicle.flatNumber, assignmentType: "resident", startsAt: `2026-01-${String(10 + index).padStart(2, "0")}T09:00:00.000Z`, endsAt: null, status: "active", notes: "Annual resident parking assignment." }))

export const parkingSlotsMock: ParkingSlot[] = Array.from({ length: 18 }, (_, index) => {
  const number = index + 1; const assignment = activeAssignments[index] ?? null; const guest = number === 7
  return { id: `slot-${number}`, slotNumber: `${index < 10 ? "B1" : "P"}-${String(number).padStart(2, "0")}`, zone: index < 10 ? "Basement 1" : "Podium", floor: index < 10 ? "B1" : "Ground", type: (number % 6 === 0 ? "EV" : number % 5 === 0 ? "Guest" : "Resident") as ParkingSlotType, status: assignment ? "occupied" : guest ? "reserved" : "vacant", assignment, createdAt: "2025-12-01T09:00:00.000Z", updatedAt: "2026-07-01T09:00:00.000Z" }
})

export const parkingHistoryMock: ParkingAssignment[] = [{ id: "history-1", slotId: "slot-8", slotNumber: "B1-08", vehicleId: "vehicle-4", vehicleNumber: "GJ01GH3456", residentId: "resident-4", residentName: "Meera Rao", flatNumber: "B-704", assignmentType: "resident", startsAt: "2026-01-12T09:00:00.000Z", endsAt: "2026-06-30T18:00:00.000Z", status: "completed", notes: "Released after vehicle change." }]
