import { getCloudinaryClient } from "../config/cloudinary.js"
import ApiError from "../utils/ApiError.js"

export function uploadProfileImageToCloudinary(buffer, userId) {
  const cloudinary = getCloudinaryClient()

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "urban-nest/profile-images",
        public_id: `user-${userId}-${Date.now()}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      },
      (error, result) => {
        if (error || !result?.public_id || !result?.secure_url) {
          reject(new ApiError(502, error?.message || "Profile image upload failed."))
          return
        }

        resolve({ public_id: result.public_id, secure_url: result.secure_url })
      }
    )

    uploadStream.end(buffer)
  })
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) {
    return null
  }

  try {
    return await getCloudinaryClient().uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    })
  } catch (error) {
    throw new ApiError(502, error.message || "Old profile image could not be deleted.")
  }
}
