import { body, param, query } from "express-validator"

import {
  BLOOD_GROUPS,
  RESIDENT_DOCUMENT_TYPES,
  RESIDENT_OWNERSHIP_TYPES,
  RESIDENT_STATUSES,
} from "../config/resident.js"
import { validationResultMiddleware } from "./register.validator.js"

const phonePattern = /^[6-9]\d{9}$/
const residentFields = new Set([
  "userId", "towerId", "flatId", "ownershipType", "moveInDate", "emergencyContact", "bloodGroup", "occupation", "status",
])
const familyFields = new Set(["name", "relation", "gender", "dateOfBirth", "mobileNumber", "email", "occupation"])
const residentIdRule = param("id").isMongoId().withMessage("A valid resident ID is required")
const rejectUnknown = (allowed, requireOne = false) => body().custom((value) => {
  const keys = Object.keys(value || {})
  if (requireOne && !keys.length) throw new Error("At least one field is required")
  const invalid = keys.find((key) => !allowed.has(key))
  if (invalid) throw new Error(`${invalid} is not allowed`)
  return true
})
const dateRule = (field, optional = false) => {
  let rule = body(field)
  if (optional) rule = rule.optional()
  return rule.isISO8601().withMessage(`${field} must be a valid date`).toDate()
    .custom((date) => date <= new Date()).withMessage(`${field} cannot be in the future`)
}
const commonResidentRules = (optional = false) => [
  body("towerId")[optional ? "optional" : "exists"]().isMongoId().withMessage("A valid tower ID is required"),
  body("flatId")[optional ? "optional" : "exists"]().isMongoId().withMessage("A valid flat ID is required"),
  body("ownershipType")[optional ? "optional" : "exists"]().isIn(RESIDENT_OWNERSHIP_TYPES).withMessage("Invalid ownership type"),
  dateRule("moveInDate", optional),
  body("emergencyContact")[optional ? "optional" : "exists"]().trim().matches(phonePattern)
    .withMessage("A valid emergency contact is required"),
  body("bloodGroup").optional({ nullable: true }).isIn(BLOOD_GROUPS).withMessage("Invalid blood group"),
  body("occupation").optional().trim().isLength({ max: 100 }),
  body("status").optional().isIn(RESIDENT_STATUSES).withMessage("Invalid resident status"),
]

export const residentIdValidation = [residentIdRule]
export const createResidentValidation = [
  rejectUnknown(residentFields),
  body("userId").isMongoId().withMessage("A valid Resident user ID is required"),
  ...commonResidentRules(false),
]
export const updateResidentValidation = [
  residentIdRule,
  rejectUnknown(residentFields, true),
  body("userId").not().exists().withMessage("User cannot be changed"),
  ...commonResidentRules(true),
]
export const statusValidation = [
  residentIdRule,
  body("status").isIn(RESIDENT_STATUSES).withMessage("Status must be Active or Inactive"),
  body().custom((value) => {
    if (Object.keys(value || {}).some((key) => key !== "status")) throw new Error("Only status can be updated")
    return true
  }),
]
export const listResidentValidation = [
  query("towerId").optional().isMongoId(),
  query("floorNumber").optional().isInt({ min: 1 }),
  query("flatNumber").optional().trim().isLength({ max: 20 }),
  query("ownershipType").optional().isIn(RESIDENT_OWNERSHIP_TYPES),
  query("status").optional().isIn(RESIDENT_STATUSES),
  query("search").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["ownershipType", "moveInDate", "status", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
]
const familyRules = (optional = false) => [
  body("name")[optional ? "optional" : "exists"]().trim().notEmpty().isLength({ max: 100 }),
  body("relation")[optional ? "optional" : "exists"]().trim().notEmpty().isLength({ max: 50 }),
  body("gender")[optional ? "optional" : "exists"]().isIn(["Male", "Female", "Other"]),
  dateRule("dateOfBirth", optional),
  body("mobileNumber").optional({ nullable: true }).trim().matches(phonePattern),
  body("email").optional({ nullable: true }).trim().normalizeEmail().isEmail(),
  body("occupation").optional().trim().isLength({ max: 100 }),
]
export const addFamilyValidation = [
  residentIdRule,
  rejectUnknown(familyFields),
  ...familyRules(false),
]
export const updateFamilyValidation = [
  residentIdRule,
  param("familyId").isMongoId().withMessage("A valid family member ID is required"),
  rejectUnknown(familyFields, true),
  ...familyRules(true),
]
export const familyIdValidation = [
  residentIdRule,
  param("familyId").isMongoId().withMessage("A valid family member ID is required"),
]
export const documentValidation = [
  residentIdRule,
  body("documentType").isIn(RESIDENT_DOCUMENT_TYPES).withMessage("Invalid document type"),
]

export { validationResultMiddleware }
