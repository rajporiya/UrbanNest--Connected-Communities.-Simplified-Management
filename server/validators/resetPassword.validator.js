import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/

export const resetPasswordValidation = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Token is required")
    .isString()
    .withMessage("Token must be a valid string"),
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
]

export { validationResultMiddleware }

export default resetPasswordValidation
