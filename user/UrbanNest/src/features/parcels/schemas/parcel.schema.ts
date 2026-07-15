import { z } from "zod"
export const receiveParcelSchema = z.object({ courierName: z.string().min(1, "Courier is required"), trackingNumber: z.string().trim().min(3, "Tracking number is required").max(60), residentId: z.string().min(1, "Resident is required"), packageType: z.string().min(1, "Package type is required"), receivedBy: z.string().trim().min(2, "Receiving guard name is required").max(80), notes: z.string().trim().max(300) })
export type ReceiveParcelFormValues = z.infer<typeof receiveParcelSchema>
export const receiveParcelDefaults: ReceiveParcelFormValues = { courierName: "", trackingNumber: "", residentId: "", packageType: "Box", receivedBy: "", notes: "" }
