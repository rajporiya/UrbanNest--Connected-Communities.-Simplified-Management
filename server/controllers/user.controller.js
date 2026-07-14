import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  getMyProfile,
  updateMyProfile,
  uploadMyProfileImage,
} from "../services/user.service.js"

function getAuthenticatedUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getMyProfile(getAuthenticatedUserId(req))

  return successResponse(res, "Profile fetched successfully.", { user }, 200)
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateMyProfile(getAuthenticatedUserId(req), req.body)

  return successResponse(res, "Profile updated successfully.", { user }, 200)
})

export const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await uploadMyProfileImage(getAuthenticatedUserId(req), req.file)

  return successResponse(res, "Profile image uploaded successfully.", { user }, 200)
})
