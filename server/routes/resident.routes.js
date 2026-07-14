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
import residentDocumentUpload from "../middleware/residentDocumentUpload.js"
import {
  addFamily,
  create,
  getOne,
  list,
  remove,
  removeFamily,
  update,
  updateFamily,
  updateStatus,
  uploadDocument,
} from "../controllers/resident-management.controller.js"
import {
  assignValidation,
  historyValidation,
  listAssignmentValidation,
  removeValidation,
  transferValidation,
  validationResultMiddleware,
} from "../validators/resident-assignment.validator.js"
import {
  addFamilyValidation,
  createResidentValidation,
  documentValidation,
  familyIdValidation,
  listResidentValidation,
  residentIdValidation,
  statusValidation,
  updateFamilyValidation,
  updateResidentValidation,
  validationResultMiddleware as residentValidationResultMiddleware,
} from "../validators/resident-management.validator.js"

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

const residentManagers = authorize(ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER)

router.get("/", residentManagers, listResidentValidation, residentValidationResultMiddleware, list)
router.post("/", residentManagers, createResidentValidation, residentValidationResultMiddleware, create)
router.post(
  "/:id/family",
  residentManagers,
  addFamilyValidation,
  residentValidationResultMiddleware,
  addFamily
)
router.put(
  "/:id/family/:familyId",
  residentManagers,
  updateFamilyValidation,
  residentValidationResultMiddleware,
  updateFamily
)
router.delete(
  "/:id/family/:familyId",
  residentManagers,
  familyIdValidation,
  residentValidationResultMiddleware,
  removeFamily
)
router.post(
  "/:id/documents",
  residentManagers,
  residentDocumentUpload,
  documentValidation,
  residentValidationResultMiddleware,
  uploadDocument
)
router.patch(
  "/:id/status",
  authorize(ROLES.COMMITTEE_HEAD),
  statusValidation,
  residentValidationResultMiddleware,
  updateStatus
)
router.get("/:id", residentIdValidation, residentValidationResultMiddleware, getOne)
router.put("/:id", residentManagers, updateResidentValidation, residentValidationResultMiddleware, update)
router.delete(
  "/:id",
  authorize(ROLES.COMMITTEE_HEAD),
  residentIdValidation,
  residentValidationResultMiddleware,
  remove
)

export default router
