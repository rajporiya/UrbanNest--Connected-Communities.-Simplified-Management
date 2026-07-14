import express from "express"

import {
  changePassword,
  forgotPassword,
  login,
  profile,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import {
  changePasswordValidation,
  validationResultMiddleware as changePasswordValidationResultMiddleware,
} from "../validators/changePassword.validator.js"
import { forgotPasswordValidation, validationResultMiddleware as forgotPasswordValidationResultMiddleware } from "../validators/forgotPassword.validator.js"
import { loginValidation, validationResultMiddleware as loginValidationResultMiddleware } from "../validators/login.validator.js"
import { registerValidation, validationResultMiddleware as registerValidationResultMiddleware } from "../validators/register.validator.js"
import {
  resetPasswordValidation,
  validationResultMiddleware as resetPasswordValidationResultMiddleware,
} from "../validators/resetPassword.validator.js"
import {
  validationResultMiddleware as verifyEmailValidationResultMiddleware,
  verifyEmailValidation,
} from "../validators/verifyEmail.validator.js"

const router = express.Router()

router.post("/register", registerValidation, registerValidationResultMiddleware, register)
router.post("/login", loginValidation, loginValidationResultMiddleware, login)
router.get("/profile", authMiddleware, profile)
router.post("/forgot-password", forgotPasswordValidation, forgotPasswordValidationResultMiddleware, forgotPassword)
router.post("/reset-password", resetPasswordValidation, resetPasswordValidationResultMiddleware, resetPassword)
router.get("/verify-email", verifyEmailValidation, verifyEmailValidationResultMiddleware, verifyEmail)
router.put(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  changePasswordValidationResultMiddleware,
  changePassword
)

export default router
