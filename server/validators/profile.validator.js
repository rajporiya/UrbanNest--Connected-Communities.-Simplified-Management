import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

const indianMobileNumberPattern = /^[6-9]\d{9}$/

export const updateProfileValidation = [
  body().custom((value) => {
    const allowedFields = new Set(["firstName", "lastName", "phone", "profileImage"])
    const submittedFields = Object.keys(value || {})

    if (!submittedFields.length) {
      throw new Error("At least one profile field is required")
    }

    const restrictedField = submittedFields.find((field) => !allowedFields.has(field))
    if (restrictedField) {
      throw new Error(`${restrictedField} cannot be updated`)
    }

    return true
  }),
  body("firstName")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(indianMobileNumberPattern)
    .withMessage("Please provide a valid Indian mobile number with exactly 10 digits"),
  body("profileImage")
    .optional()
    .trim()
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Profile image must be a valid HTTPS URL"),
]

export { validationResultMiddleware }

export default updateProfileValidation
