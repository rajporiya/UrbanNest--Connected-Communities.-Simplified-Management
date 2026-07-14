import express from "express"

import ROLES from "../config/roles.js"
import { create, getOne, list, remove, update, updateStatus } from "../controllers/security-guard.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import {
  createGuardValidation,
  guardIdValidation,
  listGuardValidation,
  statusValidation,
  updateGuardValidation,
  validationResultMiddleware,
} from "../validators/security-guard.validator.js"

const router = express.Router()
router.use(authMiddleware)
router.get(
  "/",
  authorize(ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER),
  listGuardValidation,
  validationResultMiddleware,
  list
)
router.get("/:id", guardIdValidation, validationResultMiddleware, getOne)
router.post("/", authorize(ROLES.COMMITTEE_HEAD), createGuardValidation, validationResultMiddleware, create)
router.put("/:id", authorize(ROLES.COMMITTEE_HEAD), updateGuardValidation, validationResultMiddleware, update)
router.patch("/:id/status", authorize(ROLES.COMMITTEE_HEAD), statusValidation, validationResultMiddleware, updateStatus)
router.delete("/:id", authorize(ROLES.COMMITTEE_HEAD), guardIdValidation, validationResultMiddleware, remove)

export default router
