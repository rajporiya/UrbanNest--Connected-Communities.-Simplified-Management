import express from "express"

import healthRoutes from "./health.routes.js"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import towerRoutes from "./tower.routes.js"
import flatRoutes from "./flat.routes.js"
import residentRoutes from "./resident.routes.js"
import committeeMemberRoutes from "./committee-member.routes.js"
import securityGuardRoutes from "./security-guard.routes.js"
import visitorRoutes from "./visitor.routes.js"

const router = express.Router()

router.use("/health", healthRoutes)
router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/towers", towerRoutes)
router.use("/flats", flatRoutes)
router.use("/residents", residentRoutes)
router.use("/committee-members", committeeMemberRoutes)
router.use("/security-guards", securityGuardRoutes)
router.use("/visitors", visitorRoutes)

export default router
