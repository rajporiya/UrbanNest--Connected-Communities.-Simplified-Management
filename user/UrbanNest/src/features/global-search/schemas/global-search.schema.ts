import { z } from "zod"

export const globalSearchQuerySchema = z
  .string()
  .trim()
  .max(100, "Search is limited to 100 characters")
