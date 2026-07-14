import { body } from "express-validator"

import { USER_ROLE_OPTIONS } from "../config/auth.js"

const registerValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(USER_ROLE_OPTIONS)
    .withMessage("Please provide a valid role"),
]

const loginValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
]

const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address"),
]

const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
]

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters long"),
]

export {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
}
