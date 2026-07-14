import { body, param, query } from "express-validator"

import {
  COMMITTEE_DEPARTMENTS,
  COMMITTEE_PERMISSIONS,
  COMMITTEE_STATUSES,
} from "../config/committee.js"
import { validationResultMiddleware } from "./register.validator.js"

const fields = new Set([
  "userId", "department", "designation", "joiningDate", "responsibilities", "permissions", "status",
])
const idRule = param("id").isMongoId().withMessage("A valid committee member ID is required")
const rejectUnknown = (requireOne = false) => body().custom((value) => {
  const keys = Object.keys(value || {})
  if (requireOne && !keys.length) throw new Error("At least one field is required")
  const invalid = keys.find((key) => !fields.has(key))
  if (invalid) throw new Error(`${invalid} is not allowed`)
  return true
})
const joiningDateRule = (optional = false) => {
  let rule = body("joiningDate")
  if (optional) rule = rule.optional()
  return rule.isISO8601().withMessage("joiningDate must be a valid date").toDate()
    .custom((value) => value <= new Date()).withMessage("joiningDate cannot be in the future")
}
const responsibilitiesRule = () => body("responsibilities").optional().isArray({ max: 50 })
  .withMessage("responsibilities must be an array with at most 50 items")
  .custom((items) => items.every((item) => typeof item === "string" && item.trim() && item.length <= 300))
  .withMessage("Each responsibility must be a non-empty string of at most 300 characters")
const permissionsRule = () => body("permissions").optional().isArray({ max: COMMITTEE_PERMISSIONS.length })
  .withMessage("permissions must be an array")
  .custom((items) => items.every((permission) => COMMITTEE_PERMISSIONS.includes(permission)))
  .withMessage("One or more permissions are invalid")

export const memberIdValidation = [idRule]
export const createMemberValidation = [
  rejectUnknown(),
  body("userId").isMongoId().withMessage("A valid Committee Member user ID is required"),
  body("department").isIn(COMMITTEE_DEPARTMENTS).withMessage("Invalid department"),
  body("designation").trim().notEmpty().isLength({ max: 100 }).withMessage("Designation is required"),
  joiningDateRule(),
  responsibilitiesRule(),
  permissionsRule(),
  body("status").optional().isIn(COMMITTEE_STATUSES).withMessage("Invalid status"),
]
export const updateMemberValidation = [
  idRule,
  rejectUnknown(true),
  body("userId").not().exists().withMessage("User cannot be changed"),
  body("department").optional().isIn(COMMITTEE_DEPARTMENTS).withMessage("Invalid department"),
  body("designation").optional().trim().notEmpty().isLength({ max: 100 }),
  joiningDateRule(true),
  responsibilitiesRule(),
  permissionsRule(),
  body("status").optional().isIn(COMMITTEE_STATUSES).withMessage("Invalid status"),
]
export const statusValidation = [
  idRule,
  body("status").isIn(COMMITTEE_STATUSES).withMessage("Status must be Active or Inactive"),
  body().custom((value) => {
    if (Object.keys(value || {}).some((key) => key !== "status")) throw new Error("Only status can be updated")
    return true
  }),
]
export const listMemberValidation = [
  query("department").optional().isIn(COMMITTEE_DEPARTMENTS),
  query("status").optional().isIn(COMMITTEE_STATUSES),
  query("designation").optional().trim().isLength({ max: 100 }),
  query("search").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["department", "designation", "joiningDate", "status", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
]

export { validationResultMiddleware }
