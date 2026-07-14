import { body, validationResult } from "express-validator"

import ROLES, { ALL_ROLES } from "../config/roles.js"

const indianMobileNumberPattern = /^[6-9]\d{9}$/
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/

export const registerValidation = [
  body("firstName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(indianMobileNumberPattern)
    .withMessage("Please provide a valid Indian mobile number with exactly 10 digits"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(strongPasswordPattern)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm password must match password"),
  body("role")
    .optional()
    .trim()
    .isIn(ALL_ROLES)
    .withMessage("Please provide a valid role")
    .customSanitizer((value) => (value ? value : ROLES.RESIDENT)),
]

export function validationResultMiddleware(req, res, next) {
  const result = validationResult(req)

  if (result.isEmpty()) {
    return next()
  }

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
    timestamp: new Date().toISOString(),
  })
}

export default registerValidation
