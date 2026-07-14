import { body, param, query } from "express-validator"

import {
  SECURITY_GUARD_GATES,
  SECURITY_GUARD_SHIFTS,
  SECURITY_GUARD_STATUSES,
} from "../config/security-guard.js"
import { validationResultMiddleware } from "./register.validator.js"

const fields = new Set([
  "userId", "employeeId", "gate", "shift", "joiningDate", "contactNumber", "emergencyContact", "status",
])
const phonePattern = /^[6-9]\d{9}$/
const idRule = param("id").isMongoId().withMessage("A valid security guard ID is required")
const rejectUnknown = (requireOne = false) => body().custom((value) => {
  const keys = Object.keys(value || {})
  if (requireOne && !keys.length) throw new Error("At least one field is required")
  const invalid = keys.find((key) => !fields.has(key))
  if (invalid) throw new Error(`${invalid} is not allowed`)
  return true
})
const dateRule = (optional = false) => {
  let rule = body("joiningDate")
  if (optional) rule = rule.optional()
  return rule.isISO8601().withMessage("joiningDate must be a valid date").toDate()
    .custom((date) => date <= new Date()).withMessage("joiningDate cannot be in the future")
}

export const guardIdValidation = [idRule]
export const createGuardValidation = [
  rejectUnknown(),
  body("userId").isMongoId().withMessage("A valid Security Guard user ID is required"),
  body("employeeId").trim().notEmpty().isLength({ max: 30 }).matches(/^[A-Za-z0-9_-]+$/)
    .withMessage("Employee ID may contain letters, numbers, underscores, and hyphens"),
  body("gate").isIn(SECURITY_GUARD_GATES).withMessage("Invalid gate"),
  body("shift").isIn(Object.keys(SECURITY_GUARD_SHIFTS)).withMessage("Invalid shift"),
  dateRule(),
  body("contactNumber").trim().matches(phonePattern).withMessage("A valid contact number is required"),
  body("emergencyContact").trim().matches(phonePattern).withMessage("A valid emergency contact is required"),
  body("status").optional().isIn(SECURITY_GUARD_STATUSES).withMessage("Invalid status"),
]
export const updateGuardValidation = [
  idRule,
  rejectUnknown(true),
  body("userId").not().exists().withMessage("User cannot be changed"),
  body("employeeId").optional().trim().notEmpty().isLength({ max: 30 }).matches(/^[A-Za-z0-9_-]+$/),
  body("gate").optional().isIn(SECURITY_GUARD_GATES).withMessage("Invalid gate"),
  body("shift").optional().isIn(Object.keys(SECURITY_GUARD_SHIFTS)).withMessage("Invalid shift"),
  dateRule(true),
  body("contactNumber").optional().trim().matches(phonePattern),
  body("emergencyContact").optional().trim().matches(phonePattern),
  body("status").optional().isIn(SECURITY_GUARD_STATUSES).withMessage("Invalid status"),
]
export const statusValidation = [
  idRule,
  body("status").isIn(SECURITY_GUARD_STATUSES).withMessage("Status must be Active or Inactive"),
  body().custom((value) => {
    if (Object.keys(value || {}).some((key) => key !== "status")) throw new Error("Only status can be updated")
    return true
  }),
]
export const listGuardValidation = [
  query("gate").optional().isIn(SECURITY_GUARD_GATES),
  query("shift").optional().isIn(Object.keys(SECURITY_GUARD_SHIFTS)),
  query("status").optional().isIn(SECURITY_GUARD_STATUSES),
  query("search").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["employeeId", "gate", "shift", "joiningDate", "status", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
]

export { validationResultMiddleware }
