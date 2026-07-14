import compression from "compression"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"

import apiRoutes from "./routes/index.js"
import errorHandler from "./middleware/errorHandler.js"
import notFound from "./middleware/notFound.js"

dotenv.config()

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
)
app.use(compression())
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(limiter)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Society Management System API",
  })
})

app.use("/api", apiRoutes)

app.use(notFound)
app.use(errorHandler)

export default app