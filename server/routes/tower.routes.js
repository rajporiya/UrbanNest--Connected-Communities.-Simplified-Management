import express from "express"
import ROLES from "../config/roles.js"
import { create, getOne, list, remove, update } from "../controllers/tower.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import { createTowerValidation, listTowerValidation, towerIdValidation, updateTowerValidation, validationResultMiddleware } from "../validators/tower.validator.js"

const router = express.Router()
router.use(authMiddleware)
router.get("/", listTowerValidation, validationResultMiddleware, list)
router.get("/:id", towerIdValidation, validationResultMiddleware, getOne)
router.post("/", authorize(ROLES.COMMITTEE_HEAD), createTowerValidation, validationResultMiddleware, create)
router.put("/:id", authorize(ROLES.COMMITTEE_HEAD), updateTowerValidation, validationResultMiddleware, update)
router.delete("/:id", authorize(ROLES.COMMITTEE_HEAD), towerIdValidation, validationResultMiddleware, remove)
export default router
