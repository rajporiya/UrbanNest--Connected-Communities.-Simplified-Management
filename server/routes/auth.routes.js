import express from "express"

import { login, profile, register } from "../controllers/auth.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import { loginValidation, validationResultMiddleware as loginValidationResultMiddleware } from "../validators/login.validator.js"
import { registerValidation, validationResultMiddleware as registerValidationResultMiddleware } from "../validators/register.validator.js"

const router = express.Router()

router.post("/register", registerValidation, registerValidationResultMiddleware, register)
router.post("/login", loginValidation, loginValidationResultMiddleware, login)
router.get("/profile", authMiddleware, profile)

export default router
