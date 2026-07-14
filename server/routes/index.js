import express from "express"

import healthRoutes from "./health.routes.js"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import towerRoutes from "./tower.routes.js"
import flatRoutes from "./flat.routes.js"

const router = express.Router()

router.use("/health", healthRoutes)
router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/towers", towerRoutes)
router.use("/flats", flatRoutes)

export default router
