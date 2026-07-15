import { z } from "zod"

export const flatFormSchema = z
  .object({
    towerId: z.string().trim().min(1, "Tower is required"),
    floorNumber: z
      .number({ error: "Floor must be a number" })
      .int("Floor must be a whole number")
      .min(0, "Floor cannot be below 0")
      .max(200, "Floor cannot exceed 200"),
    flatNumber: z
      .string()
      .trim()
      .min(1, "Flat number is required")
      .max(20, "Flat number cannot exceed 20 characters")
      .regex(/^[A-Za-z0-9][A-Za-z0-9/-]*$/, "Use letters, numbers, slashes, or hyphens"),
    bhkType: z.enum(["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Penthouse"], {
      error: "BHK type is required",
    }),
    areaSqFt: z
      .number({ error: "Area must be a number" })
      .int("Area must be a whole number")
      .min(100, "Area must be at least 100 sq ft")
      .max(50_000, "Area cannot exceed 50,000 sq ft"),
    ownerName: z
      .string()
      .trim()
      .max(100, "Owner name cannot exceed 100 characters"),
    occupancyStatus: z.enum(["occupied", "vacant", "reserved"], {
      error: "Occupancy status is required",
    }),
  })
  .superRefine((values, context) => {
    if (values.occupancyStatus === "occupied" && values.ownerName.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["ownerName"],
        message: "Owner name is required for an occupied flat",
      })
    }
  })

export type FlatFormValues = z.infer<typeof flatFormSchema>

export const flatFormDefaultValues: FlatFormValues = {
  towerId: "",
  floorNumber: 1,
  flatNumber: "",
  bhkType: "2 BHK",
  areaSqFt: 900,
  ownerName: "",
  occupancyStatus: "vacant",
}
