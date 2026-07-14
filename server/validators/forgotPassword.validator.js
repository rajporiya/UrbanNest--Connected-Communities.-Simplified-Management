import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
]

export { validationResultMiddleware }

export default forgotPasswordValidation
