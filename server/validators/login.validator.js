import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

export const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
]

export { validationResultMiddleware }

export default loginValidation
