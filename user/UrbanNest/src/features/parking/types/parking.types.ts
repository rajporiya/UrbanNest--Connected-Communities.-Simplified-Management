export type ParkingSlotStatus = "vacant" | "occupied" | "reserved"
export type ParkingSlotType = "Resident" | "Guest" | "Accessible" | "EV"
export type VehicleType = "Car" | "Motorcycle" | "Scooter"
export type ParkingSort = "slot_asc" | "slot_desc" | "newest"

export interface ParkingVehicle { id: string; residentId: string; residentName: string; flatNumber: string; registrationNumber: string; make: string; model: string; color: string; type: VehicleType; active: boolean; createdAt: string }
export interface ParkingAssignment { id: string; slotId: string; slotNumber: string; vehicleId: string | null; vehicleNumber: string; residentId: string | null; residentName: string; flatNumber: string; assignmentType: "resident" | "guest"; startsAt: string; endsAt: string | null; status: "active" | "completed"; notes: string }
export interface ParkingSlot { id: string; slotNumber: string; zone: string; floor: string; type: ParkingSlotType; status: ParkingSlotStatus; assignment: ParkingAssignment | null; createdAt: string; updatedAt: string }
export interface ParkingQuery { page?: number; limit?: number; search?: string; status?: ParkingSlotStatus; type?: ParkingSlotType; zone?: string; sort?: ParkingSort }
export interface ParkingListResponse { items: ParkingSlot[]; page: number; limit: number; total: number; totalPages: number }
export interface AssignParkingRequest { slotId: string; vehicleId: string; residentId: string; residentName: string; flatNumber: string; startsAt: string; notes: string }
export interface RegisterGuestParkingRequest { slotId: string; guestName: string; flatNumber: string; vehicleNumber: string; startsAt: string; endsAt: string; notes: string }
export interface CreateVehicleRequest { residentId: string; residentName: string; flatNumber: string; registrationNumber: string; make: string; model: string; color: string; type: VehicleType }
