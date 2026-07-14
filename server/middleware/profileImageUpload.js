import multer from "multer"

import ApiError from "../utils/ApiError.js"

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const extension = file.originalname.split(".").pop()?.toLowerCase()
    const isAllowed = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)

    if (!isAllowed) {
      callback(new ApiError(400, "Only JPG, JPEG, PNG, and WEBP images are allowed."))
      return
    }

    callback(null, true)
  },
}).single("profileImage")

export function profileImageUpload(req, res, next) {
  upload(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(413, "Profile image cannot exceed 5MB."))
    }

    return next(error instanceof ApiError ? error : new ApiError(400, error.message))
  })
}

export default profileImageUpload
