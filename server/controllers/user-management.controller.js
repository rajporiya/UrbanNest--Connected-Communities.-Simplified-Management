import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  createManagedUser,
  getManagedUserById,
  getManagedUsers,
  setManagedUserStatus,
  softDeleteManagedUser,
  updateManagedUser,
} from "../services/user-management.service.js"

const actorId = (req) => req.user?.userId || req.user?.id || req.user?._id

export const createUser = asyncHandler(async (req, res) => {
  const user = await createManagedUser(req.body)
  return successResponse(res, "User created successfully.", { user }, 201)
})

export const getUsers = asyncHandler(async (req, res) => {
  const result = await getManagedUsers(req.query)
  return successResponse(res, "Users fetched successfully.", result, 200)
})

export const getUser = asyncHandler(async (req, res) => {
  const user = await getManagedUserById(req.params.id)
  return successResponse(res, "User fetched successfully.", { user }, 200)
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateManagedUser(req.params.id, req.body, actorId(req))
  return successResponse(res, "User updated successfully.", { user }, 200)
})

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await setManagedUserStatus(req.params.id, req.body.isActive, actorId(req))
  return successResponse(res, "User status updated successfully.", { user }, 200)
})

export const deleteUser = asyncHandler(async (req, res) => {
  await softDeleteManagedUser(req.params.id, actorId(req))
  return successResponse(res, "User deleted successfully.", null, 200)
})
