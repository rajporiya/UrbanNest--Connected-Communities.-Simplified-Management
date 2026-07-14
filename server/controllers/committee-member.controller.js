import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.util.js"
import {
  createCommitteeMember,
  getCommitteeMemberById,
  getCommitteeMembers,
  removeCommitteeMember,
  setCommitteeMemberStatus,
  updateCommitteeMember,
} from "../services/committee-member.service.js"

const requester = (req) => ({
  userId: String(req.user?.userId || req.user?.id || req.user?._id),
  role: req.user?.role,
})

export const create = asyncHandler(async (req, res) => successResponse(
  res, "Committee member created successfully.", { member: await createCommitteeMember(req.body) }, 201
))
export const list = asyncHandler(async (req, res) => successResponse(
  res, "Committee members fetched successfully.", await getCommitteeMembers(req.query), 200
))
export const getOne = asyncHandler(async (req, res) => successResponse(
  res,
  "Committee member fetched successfully.",
  { member: await getCommitteeMemberById(req.params.id, requester(req)) },
  200
))
export const update = asyncHandler(async (req, res) => successResponse(
  res, "Committee member updated successfully.", { member: await updateCommitteeMember(req.params.id, req.body) }, 200
))
export const updateStatus = asyncHandler(async (req, res) => successResponse(
  res,
  "Committee member status updated successfully.",
  { member: await setCommitteeMemberStatus(req.params.id, req.body.status) },
  200
))
export const remove = asyncHandler(async (req, res) => {
  await removeCommitteeMember(req.params.id)
  return successResponse(res, "Committee member removed successfully.", null, 200)
})
