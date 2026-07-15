import { z } from "zod"

export const auditLogQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(5).max(100).optional(),
  search: z.string().max(100).optional(),
  action: z
    .enum([
      "create",
      "update",
      "delete",
      "login",
      "logout",
      "approve",
      "payment",
    ])
    .optional(),
  module: z
    .enum([
      "auth",
      "residents",
      "visitors",
      "complaints",
      "payments",
      "settings",
    ])
    .optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
})
