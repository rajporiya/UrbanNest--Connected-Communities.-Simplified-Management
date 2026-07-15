import { z } from "zod"

const wholeNumber = (label: string, maximum: number) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(maximum, `${label} cannot exceed ${maximum}`)

export const towerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tower name is required")
    .max(50, "Tower name cannot exceed 50 characters")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9 .&'-]*$/,
      "Use letters, numbers, spaces, apostrophes, ampersands, periods, or hyphens",
    ),
  numberOfFloors: wholeNumber("Number of floors", 200),
  totalFlats: wholeNumber("Total flats", 5000),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  status: z.enum(["active", "inactive"], {
    error: "Status is required",
  }),
})

export type TowerFormValues = z.infer<typeof towerFormSchema>

export const towerFormDefaultValues: TowerFormValues = {
  name: "",
  numberOfFloors: 1,
  totalFlats: 1,
  description: "",
  status: "active",
}
