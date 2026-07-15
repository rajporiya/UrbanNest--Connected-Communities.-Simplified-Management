import { body, param, query } from "express-validator"
import { validationResultMiddleware } from "./register.validator.js"

const flatTypes = ["1BHK", "2BHK", "3BHK", "Villa", "Penthouse"]
const occupancyStatuses = ["Vacant", "Occupied", "Reserved"]
const fields = new Set(["towerId", "floorNumber", "flatNumber", "flatType", "area", "maintenanceAmount", "occupancyStatus"])
const idRule = param("id").isMongoId().withMessage("A valid flat ID is required")
const rejectUnknown = (requireOne = false) => body().custom((value) => {
  const keys = Object.keys(value || {})
  if (requireOne && !keys.length) throw new Error("At least one field is required")
  const invalid = keys.find((key) => !fields.has(key))
  if (invalid) throw new Error(`${invalid} is not allowed`)
  return true
})

export const flatIdValidation = [idRule]
export const createFlatValidation = [
  rejectUnknown(),
  body("towerId").isMongoId().withMessage("A valid tower ID is required"),
  body("floorNumber").isInt({ min: 1 }).toInt().withMessage("floorNumber must be a positive integer"),
  body("flatNumber").trim().notEmpty().isLength({ max: 20 }).withMessage("flatNumber is required"),
  body("flatType").isIn(flatTypes).withMessage("Invalid flat type"),
  body("area").isFloat({ gt: 0 }).toFloat().withMessage("area must be greater than zero"),
  body("maintenanceAmount").isFloat({ min: 0 }).toFloat().withMessage("maintenanceAmount cannot be negative"),
  body("occupancyStatus").optional().isIn(occupancyStatuses).withMessage("Invalid occupancy status"),
]
export const updateFlatValidation = [
  idRule,
  rejectUnknown(true),
  body("towerId").optional().isMongoId(),
  body("floorNumber").optional().isInt({ min: 1 }).toInt(),
  body("flatNumber").optional().trim().notEmpty().isLength({ max: 20 }),
  body("flatType").optional().isIn(flatTypes),
  body("area").optional().isFloat({ gt: 0 }).toFloat(),
  body("maintenanceAmount").optional().isFloat({ min: 0 }).toFloat(),
  body("occupancyStatus").optional().isIn(occupancyStatuses),
]
export const listFlatValidation = [
  query("towerId").optional().isMongoId(),
  query("floorNumber").optional().isInt({ min: 1 }),
  query("flatType").optional().isIn(flatTypes),
  query("occupancyStatus").optional().isIn(occupancyStatuses),
  query("search").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["floorNumber", "flatNumber", "flatType", "area", "maintenanceAmount", "occupancyStatus", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
]
export { validationResultMiddleware }
