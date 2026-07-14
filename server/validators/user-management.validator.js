import { body, param, query } from "express-validator"

import ROLES from "../config/roles.js"
import { validationResultMiddleware } from "./register.validator.js"

const managedRoles = [ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT, ROLES.SECURITY_GUARD]
const phonePattern = /^[6-9]\d{9}$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/
const locationValidation = (field) => body(field).optional().trim().isLength({ max: 20 })
  .withMessage(`${field} cannot exceed 20 characters`)

export const userIdValidation = [
  param("id").isMongoId().withMessage("A valid user ID is required"),
]

export const createUserValidation = [
  body().custom((value) => {
    const allowed = new Set([
      "firstName", "lastName", "email", "phone", "password", "profileImage", "role", "tower", "floor", "flat",
    ])
    const forbidden = Object.keys(value || {}).find((field) => !allowed.has(field))
    if (forbidden) throw new Error(`${forbidden} is not allowed`)
    return true
  }),
  body("firstName").trim().notEmpty().isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName").trim().notEmpty().isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email").trim().normalizeEmail().isEmail().withMessage("A valid email is required"),
  body("phone").trim().matches(phonePattern).withMessage("A valid 10-digit Indian mobile number is required"),
  body("password").optional().isLength({ min: 8, max: 20 }).matches(passwordPattern)
    .withMessage("Password must be 8-20 characters with uppercase, lowercase, number, and special character"),
  body("role").isIn(managedRoles)
    .withMessage("Role must be Committee Member, Resident, or Security Guard"),
  body("profileImage").optional().trim().isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Profile image must be a valid HTTPS URL"),
  locationValidation("tower"),
  locationValidation("floor"),
  locationValidation("flat"),
]

export const updateUserValidation = [
  ...userIdValidation,
  body().custom((value) => {
    const allowed = new Set([
      "firstName", "lastName", "phone", "profileImage", "role", "tower", "floor", "flat", "isActive",
    ])
    const fields = Object.keys(value || {})
    if (!fields.length) throw new Error("At least one field is required")
    const forbidden = fields.find((field) => !allowed.has(field))
    if (forbidden) throw new Error(`${forbidden} cannot be updated`)
    return true
  }),
  body("firstName").optional().trim().isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName").optional().trim().isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone").optional().trim().matches(phonePattern)
    .withMessage("A valid 10-digit Indian mobile number is required"),
  body("profileImage").optional().trim().isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Profile image must be a valid HTTPS URL"),
  body("role").optional().isIn(managedRoles)
    .withMessage("Role must be Committee Member, Resident, or Security Guard"),
  body("isActive").optional().isBoolean({ strict: true }).withMessage("isActive must be a boolean"),
  locationValidation("tower"),
  locationValidation("floor"),
  locationValidation("flat"),
]

export const statusValidation = [
  ...userIdValidation,
  body("isActive").isBoolean({ strict: true }).withMessage("isActive must be a boolean"),
  body().custom((value) => {
    if (Object.keys(value || {}).some((field) => field !== "isActive")) {
      throw new Error("Only isActive can be updated")
    }
    return true
  }),
]

export const listUsersValidation = [
  query("role").optional().isIn(managedRoles).withMessage("Invalid role filter"),
  query("tower").optional().trim().isLength({ max: 20 }),
  query("floor").optional().trim().isLength({ max: 20 }),
  query("flat").optional().trim().isLength({ max: 20 }),
  query("isActive").optional().isIn(["true", "false"]).withMessage("isActive must be true or false"),
  query("isEmailVerified").optional().isIn(["true", "false"])
    .withMessage("isEmailVerified must be true or false"),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("Search cannot exceed 100 characters"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("sortBy").optional().isIn([
    "firstName", "lastName", "email", "phone", "role", "tower", "floor", "flat", "createdAt", "updatedAt",
  ]).withMessage("Invalid sort field"),
  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("sortOrder must be asc or desc"),
]

export { validationResultMiddleware }
