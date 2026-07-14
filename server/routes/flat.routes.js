import express from "express"
import ROLES from "../config/roles.js"
import { create, getOne, list, remove, update } from "../controllers/flat.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import { createFlatValidation, flatIdValidation, listFlatValidation, updateFlatValidation, validationResultMiddleware } from "../validators/flat.validator.js"

const router = express.Router()
router.use(authMiddleware)
router.get("/", listFlatValidation, validationResultMiddleware, list)
router.get("/:id", flatIdValidation, validationResultMiddleware, getOne)
router.post("/", authorize(ROLES.COMMITTEE_HEAD), createFlatValidation, validationResultMiddleware, create)
router.put("/:id", authorize(ROLES.COMMITTEE_HEAD), updateFlatValidation, validationResultMiddleware, update)
router.delete("/:id", authorize(ROLES.COMMITTEE_HEAD), flatIdValidation, validationResultMiddleware, remove)
export default router
