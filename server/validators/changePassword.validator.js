import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isString()
    .withMessage("Current password must be a valid string"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("New password must be between 8 and 20 characters")
    .matches(strongPasswordPattern)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage("New password must be different from current password"),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password must match new password"),
]

export { validationResultMiddleware }

export default changePasswordValidation
