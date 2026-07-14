import mongoose from "mongoose"

import ROLES from "../config/roles.js"
import CommitteeMember from "../models/CommitteeMember.model.js"
import User from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"

const userSelect = "firstName lastName email phone profileImage role isActive"

async function requireCommitteeUser(userId, session = null) {
  const query = User.findOne({
    _id: userId,
    role: ROLES.COMMITTEE_MEMBER,
    isDeleted: { $ne: true },
  })
  if (session) query.session(session)
  const user = await query
  if (!user) throw new ApiError(400, "Only users with the Committee Member role can be managed.")
  return user
}

async function requireMember(id) {
  const member = await CommitteeMember.findOne({ _id: id, isDeleted: false }).populate("userId", userSelect)
  if (!member) throw new ApiError(404, "Committee member not found.")
  if (!member.userId || member.userId.role !== ROLES.COMMITTEE_MEMBER) {
    throw new ApiError(409, "The linked user no longer has the Committee Member role.")
  }
  return member
}

function assertProfileAccess(member, requester) {
  if (requester.role === ROLES.COMMITTEE_HEAD) return
  const memberUserId = member.userId?._id || member.userId
  if (requester.role !== ROLES.COMMITTEE_MEMBER || memberUserId.toString() !== requester.userId) {
    throw new ApiError(403, "You can only view your own committee profile.")
  }
}

async function synchronizeUserStatus(userId, status, session) {
  const isActive = status === "Active"
  const operation = { $set: { isActive } }
  if (!isActive) operation.$unset = { refreshToken: "", sessionId: "" }
  await User.updateOne({ _id: userId }, operation, { session })
}

async function withTransaction(work) {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}

export async function createCommitteeMember(data) {
  try {
    const memberId = await withTransaction(async (session) => {
      const user = await requireCommitteeUser(data.userId, session)
      if (await CommitteeMember.exists({ userId: user._id }).session(session)) {
        throw new ApiError(409, "This user is already assigned as a committee member.")
      }
      const [member] = await CommitteeMember.create([{
        userId: user._id,
        department: data.department,
        designation: data.designation,
        joiningDate: data.joiningDate,
        responsibilities: data.responsibilities || [],
        permissions: [...new Set(data.permissions || [])],
        status: data.status || "Active",
      }], { session })
      await synchronizeUserStatus(user._id, member.status, session)
      return member._id
    })
    return requireMember(memberId)
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "This user is already assigned as a committee member.")
    throw error
  }
}

export async function getCommitteeMembers(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false }
  if (filters.department) query.department = filters.department
  if (filters.status) query.status = filters.status
  if (filters.designation) query.designation = new RegExp(
    filters.designation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"
  )
  const userQuery = {
    role: ROLES.COMMITTEE_MEMBER,
    isDeleted: { $ne: true },
  }
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(escaped, "i")
    userQuery.$or = [{ firstName: pattern }, { lastName: pattern }, { email: pattern }, { phone: pattern }]
  }
  const validUsers = await User.find(userQuery).select("_id")
  query.userId = { $in: validUsers.map((user) => user._id) }
  const sortFields = new Set(["department", "designation", "joiningDate", "status", "createdAt", "updatedAt"])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "joiningDate"
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1
  const [members, total] = await Promise.all([
    CommitteeMember.find(query).populate("userId", userSelect).sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit).limit(limit),
    CommitteeMember.countDocuments(query),
  ])
  return { members, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getCommitteeMemberById(id, requester) {
  const member = await requireMember(id)
  assertProfileAccess(member, requester)
  return member
}

export async function updateCommitteeMember(id, data) {
  const member = await requireMember(id)
  await requireCommitteeUser(member.userId._id)

  const updateFields = ["department", "designation", "joiningDate", "responsibilities", "permissions", "status"]
  const updates = Object.fromEntries(Object.entries(data).filter(([key]) => updateFields.includes(key)))
  if (updates.permissions) updates.permissions = [...new Set(updates.permissions)]

  if (updates.status && updates.status !== member.status) {
    await withTransaction(async (session) => {
      await CommitteeMember.updateOne({ _id: id }, { $set: updates }, { session, runValidators: true })
      await synchronizeUserStatus(member.userId._id, updates.status, session)
    })
  } else {
    await CommitteeMember.updateOne({ _id: id }, { $set: updates }, { runValidators: true })
  }
  return requireMember(id)
}

export function setCommitteeMemberStatus(id, status) {
  return updateCommitteeMember(id, { status })
}

export async function removeCommitteeMember(id) {
  const member = await requireMember(id)
  await withTransaction(async (session) => {
    await CommitteeMember.updateOne(
      { _id: id },
      { $set: { isDeleted: true, deletedAt: new Date(), status: "Inactive" } },
      { session }
    )
    await synchronizeUserStatus(member.userId._id, "Inactive", session)
  })
}
