import mongoose from "mongoose"
import { seedDB } from "./seed.js"

async function connectDB(mongoUri) {
  if (!mongoUri) {
    return null
  }

  mongoose.set("strictQuery", true)

  const conn = await mongoose.connect(mongoUri)
  await seedDB().catch((err) => console.error("DB seed failed:", err))
  return conn
}

export { connectDB }