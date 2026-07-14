import express from "express"

import { register } from "../controllers/auth.controller.js"
import { registerValidation, validationResultMiddleware } from "../validators/register.validator.js"

const router = express.Router()

router.post("/register", registerValidation, validationResultMiddleware, register)

export default router
