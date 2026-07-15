import { z } from "zod"

export const reportQuerySchema = z
  .object({
    category: z.enum([
      "users",
      "payments",
      "complaints",
      "visitors",
      "amenities",
      "security",
    ]),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: "The start date must be before the end date.",
    path: ["to"],
  })
