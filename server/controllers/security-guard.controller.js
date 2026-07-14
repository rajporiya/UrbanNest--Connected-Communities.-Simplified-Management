import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  createSecurityGuard,
  getSecurityGuardById,
  getSecurityGuards,
  removeSecurityGuard,
  setSecurityGuardStatus,
  updateSecurityGuard,
} from "../services/security-guard.service.js"

const requester = (req) => ({
  userId: String(req.user?.userId || req.user?.id || req.user?._id),
  role: req.user?.role,
})

export const create = asyncHandler(async (req, res) => successResponse(
  res, "Security guard created successfully.", { guard: await createSecurityGuard(req.body) }, 201
))
export const list = asyncHandler(async (req, res) => successResponse(
  res, "Security guards fetched successfully.", await getSecurityGuards(req.query), 200
))
export const getOne = asyncHandler(async (req, res) => successResponse(
  res, "Security guard fetched successfully.",
  { guard: await getSecurityGuardById(req.params.id, requester(req)) }, 200
))
export const update = asyncHandler(async (req, res) => successResponse(
  res, "Security guard updated successfully.", { guard: await updateSecurityGuard(req.params.id, req.body) }, 200
))
export const updateStatus = asyncHandler(async (req, res) => successResponse(
  res, "Security guard status updated successfully.",
  { guard: await setSecurityGuardStatus(req.params.id, req.body.status) }, 200
))
export const remove = asyncHandler(async (req, res) => {
  await removeSecurityGuard(req.params.id)
  return successResponse(res, "Security guard removed successfully.", null, 200)
})
