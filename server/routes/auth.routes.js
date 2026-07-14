import express from "express"

import {
  changePassword,
  forgotPassword,
  login,
  profile,
  register,
  resetPassword,
} from "../controllers/auth.controller.js"
import protect from "../middleware/auth.js"
import validateRequest from "../middleware/validateRequest.js"
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from "../validators/auth.validators.js"

const router = express.Router()

router.post("/register", registerValidator, validateRequest, register)
router.post("/login", loginValidator, validateRequest, login)
router.post("/forgot-password", forgotPasswordValidator, validateRequest, forgotPassword)
router.post("/reset-password", resetPasswordValidator, validateRequest, resetPassword)
router.get("/profile", protect, profile)
router.put("/change-password", protect, changePasswordValidator, validateRequest, changePassword)

export default router
