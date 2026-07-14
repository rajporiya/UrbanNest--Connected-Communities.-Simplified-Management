import express from "express"

import ROLES from "../config/roles.js"
import {
  assignFlat,
  history,
  listAssignments,
  removeFlat,
  transferFlat,
} from "../controllers/resident-assignment.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import {
  assignValidation,
  historyValidation,
  listAssignmentValidation,
  removeValidation,
  transferValidation,
  validationResultMiddleware,
} from "../validators/resident-assignment.validator.js"

const router = express.Router()
router.use(authMiddleware)
router.get("/assignments", listAssignmentValidation, validationResultMiddleware, listAssignments)
router.get("/:id/history", historyValidation, validationResultMiddleware, history)
router.post(
  "/assign-flat",
  authorize(ROLES.COMMITTEE_HEAD),
  assignValidation,
  validationResultMiddleware,
  assignFlat
)
router.put(
  "/transfer-flat",
  authorize(ROLES.COMMITTEE_HEAD),
  transferValidation,
  validationResultMiddleware,
  transferFlat
)
router.patch(
  "/remove-flat",
  authorize(ROLES.COMMITTEE_HEAD),
  removeValidation,
  validationResultMiddleware,
  removeFlat
)

export default router
