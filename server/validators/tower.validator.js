import { body, param, query } from "express-validator"
import { validationResultMiddleware } from "./register.validator.js"

const idRule = param("id").isMongoId().withMessage("A valid tower ID is required")
const fields = new Set(["towerName", "description", "totalFloors", "totalFlats", "status"])

export const towerIdValidation = [idRule]
export const createTowerValidation = [
  body().custom((value) => {
    const invalid = Object.keys(value || {}).find((key) => !fields.has(key))
    if (invalid) throw new Error(`${invalid} is not allowed`)
    return true
  }),
  body("towerName").trim().notEmpty().isLength({ max: 20 }).withMessage("Tower name is required and cannot exceed 20 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("totalFloors").isInt({ min: 1 }).toInt().withMessage("totalFloors must be a positive integer"),
  body("totalFlats").isInt({ min: 1 }).toInt().withMessage("totalFlats must be a positive integer"),
  body("status").optional().isIn(["Active", "Inactive"]).withMessage("Invalid tower status"),
]
export const updateTowerValidation = [
  idRule,
  body().custom((value) => {
    const keys = Object.keys(value || {})
    if (!keys.length) throw new Error("At least one field is required")
    const invalid = keys.find((key) => !fields.has(key))
    if (invalid) throw new Error(`${invalid} is not allowed`)
    return true
  }),
  body("towerName").optional().trim().notEmpty().isLength({ max: 20 }),
  body("description").optional().trim().isLength({ max: 500 }),
  body("totalFloors").optional().isInt({ min: 1 }).toInt(),
  body("totalFlats").optional().isInt({ min: 1 }).toInt(),
  body("status").optional().isIn(["Active", "Inactive"]),
]
export const listTowerValidation = [
  query("status").optional().isIn(["Active", "Inactive"]),
  query("search").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["towerName", "totalFloors", "totalFlats", "status", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
]
export { validationResultMiddleware }
