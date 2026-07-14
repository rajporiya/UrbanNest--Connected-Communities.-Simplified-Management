import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  assignResidentToFlat,
  getResidentAssignments,
  getResidentHistory,
  removeResidentFromFlat,
  transferResidentFlat,
} from "../services/resident-assignment.service.js"

const requester = (req) => ({
  userId: String(req.user?.userId || req.user?.id || req.user?._id),
  role: req.user?.role,
})

export const assignFlat = asyncHandler(async (req, res) => {
  const assignment = await assignResidentToFlat(req.body, requester(req).userId)
  return successResponse(res, "Resident assigned successfully.", { assignment }, 201)
})

export const transferFlat = asyncHandler(async (req, res) => {
  const assignment = await transferResidentFlat(req.body, requester(req).userId)
  return successResponse(res, "Resident transferred successfully.", { assignment }, 200)
})

export const removeFlat = asyncHandler(async (req, res) => {
  await removeResidentFromFlat(req.body, requester(req).userId)
  return successResponse(res, "Resident removed from flat successfully.", null, 200)
})

export const history = asyncHandler(async (req, res) => {
  const assignments = await getResidentHistory(req.params.id, requester(req))
  return successResponse(res, "Resident assignment history fetched successfully.", { assignments }, 200)
})

export const listAssignments = asyncHandler(async (req, res) => {
  const result = await getResidentAssignments(req.query, requester(req))
  return successResponse(res, "Resident assignments fetched successfully.", result, 200)
})
