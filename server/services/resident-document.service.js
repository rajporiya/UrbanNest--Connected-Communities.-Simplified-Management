import { getCloudinaryClient } from "../config/cloudinary.js"
import ApiError from "../utils/ApiError.js"

export function uploadResidentDocument(buffer, residentId, originalName) {
  const cloudinary = getCloudinaryClient()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `urban-nest/resident-documents/${residentId}`,
        public_id: `document-${Date.now()}`,
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
        context: { originalName },
      },
      (error, result) => {
        if (error || !result?.public_id || !result?.secure_url) {
          reject(new ApiError(502, error?.message || "Resident document upload failed."))
          return
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type || "image",
        })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteResidentDocument(publicId, resourceType = "image") {
  if (!publicId) return null
  try {
    return await getCloudinaryClient().uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    })
  } catch (error) {
    throw new ApiError(502, error.message || "Resident document cleanup failed.")
  }
}
