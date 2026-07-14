import express from "express"

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../controllers/user.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import profileImageUpload from "../middleware/profileImageUpload.js"
import authorize from "../middleware/role.middleware.js"
import ROLES from "../config/roles.js"
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../controllers/user-management.controller.js"
import {
  updateProfileValidation,
  validationResultMiddleware as updateProfileValidationResultMiddleware,
} from "../validators/profile.validator.js"
import {
  createUserValidation,
  listUsersValidation,
  statusValidation,
  updateUserValidation,
  userIdValidation,
  validationResultMiddleware as managementValidationResultMiddleware,
} from "../validators/user-management.validator.js"

const router = express.Router()

router.use(authMiddleware)
router.get("/profile", getProfile)
router.put("/profile", updateProfileValidation, updateProfileValidationResultMiddleware, updateProfile)
router.put("/profile/image", profileImageUpload, uploadProfileImage)

router.use(authorize(ROLES.COMMITTEE_HEAD))
router.post("/", createUserValidation, managementValidationResultMiddleware, createUser)
router.get("/", listUsersValidation, managementValidationResultMiddleware, getUsers)
router.get("/:id", userIdValidation, managementValidationResultMiddleware, getUser)
router.put("/:id", updateUserValidation, managementValidationResultMiddleware, updateUser)
router.patch("/:id/status", statusValidation, managementValidationResultMiddleware, updateUserStatus)
router.delete("/:id", userIdValidation, managementValidationResultMiddleware, deleteUser)

export default router
