import express from "express"

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "../controllers/user.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import profileImageUpload from "../middleware/profileImageUpload.js"
import {
  updateProfileValidation,
  validationResultMiddleware as updateProfileValidationResultMiddleware,
} from "../validators/profile.validator.js"

const router = express.Router()

router.use(authMiddleware)
router.get("/profile", getProfile)
router.put("/profile", updateProfileValidation, updateProfileValidationResultMiddleware, updateProfile)
router.put("/profile/image", profileImageUpload, uploadProfileImage)

export default router
