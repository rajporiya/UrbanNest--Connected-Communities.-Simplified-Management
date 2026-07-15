import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import { createFlat, getFlatById, getFlats, softDeleteFlat, updateFlat } from "../services/flat.service.js"

export const create = asyncHandler(async (req, res) => successResponse(
  res, "Flat created successfully.", { flat: await createFlat(req.body) }, 201
))
export const list = asyncHandler(async (req, res) => successResponse(
  res, "Flats fetched successfully.", await getFlats(req.query), 200
))
export const getOne = asyncHandler(async (req, res) => successResponse(
  res, "Flat fetched successfully.", { flat: await getFlatById(req.params.id) }, 200
))
export const update = asyncHandler(async (req, res) => successResponse(
  res, "Flat updated successfully.", { flat: await updateFlat(req.params.id, req.body) }, 200
))
export const remove = asyncHandler(async (req, res) => {
  await softDeleteFlat(req.params.id)
  return successResponse(res, "Flat deleted successfully.", null, 200)
})
