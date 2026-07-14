import mongoose from "mongoose"

async function connectDB(mongoUri) {
  if (!mongoUri) {
    return null
  }

  mongoose.set("strictQuery", true)

  return mongoose.connect(mongoUri)
}

export { connectDB }