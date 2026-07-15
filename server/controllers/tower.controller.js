import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import { createTower, getTowerById, getTowers, softDeleteTower, updateTower } from "../services/tower.service.js"

export const create = asyncHandler(async (req, res) => successResponse(
  res, "Tower created successfully.", { tower: await createTower(req.body) }, 201
))
export const list = asyncHandler(async (req, res) => successResponse(
  res, "Towers fetched successfully.", await getTowers(req.query), 200
))
export const getOne = asyncHandler(async (req, res) => successResponse(
  res, "Tower fetched successfully.", { tower: await getTowerById(req.params.id) }, 200
))
export const update = asyncHandler(async (req, res) => successResponse(
  res, "Tower updated successfully.", { tower: await updateTower(req.params.id, req.body) }, 200
))
export const remove = asyncHandler(async (req, res) => {
  await softDeleteTower(req.params.id)
  return successResponse(res, "Tower deleted successfully.", null, 200)
})
