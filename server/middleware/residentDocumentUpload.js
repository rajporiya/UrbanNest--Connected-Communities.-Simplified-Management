import multer from "multer"

import ApiError from "../utils/ApiError.js"

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "pdf"])
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const extension = file.originalname.split(".").pop()?.toLowerCase()
    if (!allowedTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      callback(new ApiError(400, "Only JPG, JPEG, PNG, WEBP, and PDF documents are allowed."))
      return
    }
    callback(null, true)
  },
}).single("document")

export default function residentDocumentUpload(req, res, next) {
  upload(req, res, (error) => {
    if (!error) return next()
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(413, "Resident document cannot exceed 10MB."))
    }
    return next(error instanceof ApiError ? error : new ApiError(400, error.message))
  })
}
