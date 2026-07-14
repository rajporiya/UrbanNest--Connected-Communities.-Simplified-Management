import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  addFamilyMember,
  addResidentDocument,
  createResident,
  getResidentById,
  getResidents,
  removeFamilyMember,
  setResidentStatus,
  softDeleteResident,
  updateFamilyMember,
  updateResident,
} from "../services/resident-management.service.js"

const requester = (req) => ({
  userId: String(req.user?.userId || req.user?.id || req.user?._id),
  role: req.user?.role,
})

export const create = asyncHandler(async (req, res) => successResponse(
  res, "Resident created successfully.", { resident: await createResident(req.body) }, 201
))
export const list = asyncHandler(async (req, res) => successResponse(
  res, "Residents fetched successfully.", await getResidents(req.query), 200
))
export const getOne = asyncHandler(async (req, res) => successResponse(
  res, "Resident fetched successfully.", await getResidentById(req.params.id, requester(req)), 200
))
export const update = asyncHandler(async (req, res) => successResponse(
  res, "Resident updated successfully.", { resident: await updateResident(req.params.id, req.body) }, 200
))
export const updateStatus = asyncHandler(async (req, res) => successResponse(
  res, "Resident status updated successfully.",
  { resident: await setResidentStatus(req.params.id, req.body.status) }, 200
))
export const remove = asyncHandler(async (req, res) => {
  await softDeleteResident(req.params.id)
  return successResponse(res, "Resident deleted successfully.", null, 200)
})
export const addFamily = asyncHandler(async (req, res) => successResponse(
  res, "Family member added successfully.",
  { familyMember: await addFamilyMember(req.params.id, req.body) }, 201
))
export const updateFamily = asyncHandler(async (req, res) => successResponse(
  res, "Family member updated successfully.",
  { familyMember: await updateFamilyMember(req.params.id, req.params.familyId, req.body) }, 200
))
export const removeFamily = asyncHandler(async (req, res) => {
  await removeFamilyMember(req.params.id, req.params.familyId)
  return successResponse(res, "Family member removed successfully.", null, 200)
})
export const uploadDocument = asyncHandler(async (req, res) => successResponse(
  res, "Resident document uploaded successfully.",
  { resident: await addResidentDocument(req.params.id, req.body.documentType, req.file) }, 201
))
