export type ParcelStatus = "received" | "notified" | "collected" | "returned"
export type ParcelSort = "newest" | "oldest" | "recipient_asc"
export interface Parcel { id: string; referenceNumber: string; courierName: string; trackingNumber: string; residentId: string; residentName: string; residentMobile: string; towerName: string; flatNumber: string; packageType: string; receivedBy: string; receivedAt: string; status: ParcelStatus; notifiedAt: string | null; collectedAt: string | null; collectedBy: string | null; notes: string }
export interface ParcelQuery { page?: number; limit?: number; search?: string; status?: ParcelStatus; courier?: string; residentId?: string; sort?: ParcelSort }
export interface ParcelListResponse { items: Parcel[]; page: number; limit: number; total: number; totalPages: number }
export interface ReceiveParcelRequest { courierName: string; trackingNumber: string; residentId: string; residentName: string; residentMobile: string; towerName: string; flatNumber: string; packageType: string; receivedBy: string; notes: string }
export interface UpdateParcelStatusRequest { id: string; status: Exclude<ParcelStatus, "received">; collectedBy?: string }
