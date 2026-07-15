import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import {
  create,
  list,
  getOne,
  getByCode,
  checkIn,
  checkOut,
  cancel,
  report,
} from "../controllers/visitor.controller.js"
import {
  createVisitorValidation,
  listVisitorValidation,
  visitorIdValidation,
} from "../validators/visitor.validator.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/report", report)
router.get("/code/:qrCode", getByCode)
router.get("/:id", visitorIdValidation, getOne)
router.get("/", listVisitorValidation, list)
router.post("/", createVisitorValidation, create)
router.patch("/:id/check-in", visitorIdValidation, checkIn)
router.patch("/:id/check-out", visitorIdValidation, checkOut)
router.patch("/:id/cancel", visitorIdValidation, cancel)

export default router
