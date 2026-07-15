import { body, param, query } from "express-validator"
import { validationResultMiddleware } from "./register.validator.js"

const phonePattern = /^[6-9]\d{9}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export const createVisitorValidation = [
  body("residentName").trim().notEmpty().withMessage("Resident name is required"),
  body("tower").trim().notEmpty().withMessage("Tower is required"),
  body("flatNumber").trim().notEmpty().withMessage("Flat number is required"),
  body("visitorName").trim().isLength({ min: 2 }).withMessage("Visitor name must be at least 2 characters"),
  body("mobile").trim().matches(phonePattern).withMessage("A valid 10-digit mobile number is required"),
  body("purpose").isIn(["guest", "delivery", "service", "cab", "other"]).withMessage("Invalid purpose value"),
  body("purposeNote").trim().isLength({ min: 3 }).withMessage("Purpose details must be at least 3 characters"),
  body("visitDate").isISO8601().withMessage("Valid visit date is required"),
  body("validFrom").matches(timePattern).withMessage("Valid start time (HH:MM) is required"),
  body("validUntil").matches(timePattern).withMessage("Valid end time (HH:MM) is required"),
  body("vehicleNumber").optional().trim(),
  body("remarks").optional().trim(),
  validationResultMiddleware,
]

export const visitorIdValidation = [
  param("id").isMongoId().withMessage("A valid visitor ID is required"),
  validationResultMiddleware,
]

export const listVisitorValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().trim(),
  query("status").optional().isIn(["expected", "checked-in", "checked-out", "cancelled"]),
  query("purpose").optional().isIn(["guest", "delivery", "service", "cab", "other"]),
  validationResultMiddleware,
]
