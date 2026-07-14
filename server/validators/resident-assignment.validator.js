import { body, param, query } from "express-validator"
import { validationResultMiddleware } from "./register.validator.js"

const onlyFields = (allowed) => body().custom((value) => {
  const invalid = Object.keys(value || {}).find((field) => !allowed.includes(field))
  if (invalid) throw new Error(`${invalid} is not allowed`)
  return true
})

export const assignValidation = [
  onlyFields(["residentId", "towerId", "flatId", "reason"]),
  body("residentId").isMongoId().withMessage("A valid resident ID is required"),
  body("towerId").isMongoId().withMessage("A valid tower ID is required"),
  body("flatId").isMongoId().withMessage("A valid flat ID is required"),
  body("reason").optional().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),
]

export const transferValidation = [
  onlyFields(["residentId", "currentFlatId", "newFlatId", "reason"]),
  body("residentId").isMongoId().withMessage("A valid resident ID is required"),
  body("currentFlatId").isMongoId().withMessage("A valid current flat ID is required"),
  body("newFlatId").isMongoId().withMessage("A valid new flat ID is required"),
  body("reason").trim().notEmpty().isLength({ max: 500 }).withMessage("Transfer reason is required"),
  body("newFlatId").custom((value, { req }) => value !== req.body.currentFlatId)
    .withMessage("New flat must be different from current flat"),
]

export const removeValidation = [
  onlyFields(["residentId", "flatId", "reason"]),
  body("residentId").isMongoId().withMessage("A valid resident ID is required"),
  body("flatId").optional().isMongoId().withMessage("flatId must be valid"),
  body("reason").optional().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),
]

export const historyValidation = [
  param("id").isMongoId().withMessage("A valid resident ID is required"),
]

export const listAssignmentValidation = [
  query("towerId").optional().isMongoId().withMessage("towerId must be valid"),
  query("floorNumber").optional().isInt({ min: 1 }).withMessage("floorNumber must be positive"),
  query("flatNumber").optional().trim().isLength({ max: 20 }),
  query("residentName").optional().trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
]

export { validationResultMiddleware }
