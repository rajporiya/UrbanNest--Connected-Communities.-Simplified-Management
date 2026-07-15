import { v2 as cloudinary } from "cloudinary"

import ApiError from "../utils/ApiError.js"

export function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured.")
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return cloudinary
}

export default getCloudinaryClient
