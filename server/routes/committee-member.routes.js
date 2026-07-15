import express from "express"

import ROLES from "../config/roles.js"
import { create, getOne, list, remove, update, updateStatus } from "../controllers/committee-member.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import authorize from "../middleware/role.middleware.js"
import {
  createMemberValidation,
  listMemberValidation,
  memberIdValidation,
  statusValidation,
  updateMemberValidation,
  validationResultMiddleware,
} from "../validators/committee-member.validator.js"

const router = express.Router()
router.use(authMiddleware)
router.get("/:id", memberIdValidation, validationResultMiddleware, getOne)
router.get("/", authorize(ROLES.COMMITTEE_HEAD), listMemberValidation, validationResultMiddleware, list)
router.post("/", authorize(ROLES.COMMITTEE_HEAD), createMemberValidation, validationResultMiddleware, create)
router.put("/:id", authorize(ROLES.COMMITTEE_HEAD), updateMemberValidation, validationResultMiddleware, update)
router.patch("/:id/status", authorize(ROLES.COMMITTEE_HEAD), statusValidation, validationResultMiddleware, updateStatus)
router.delete("/:id", authorize(ROLES.COMMITTEE_HEAD), memberIdValidation, validationResultMiddleware, remove)

export default router
