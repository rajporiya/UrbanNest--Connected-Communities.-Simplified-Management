import mongoose from "mongoose"

import { SECURITY_GUARD_SHIFTS } from "../config/security-guard.js"
import ROLES from "../config/roles.js"
import SecurityGuard from "../models/SecurityGuard.js"
import User from "../models/User.js"
import ApiError from "../utils/ApiError.js"

const userSelect = "firstName lastName email phone profileImage role isActive"

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

async function requireGuardUser(userId, session = null) {
  const query = User.findOne({
    _id: userId,
    role: ROLES.SECURITY_GUARD,
    isDeleted: { $ne: true },
  })
  if (session) query.session(session)
  const user = await query
  if (!user) throw new ApiError(400, "Only users with the Security Guard role can be assigned.")
  return user
}

async function requireGuard(id) {
  const guard = await SecurityGuard.findOne({ _id: id, isDeleted: false }).populate("userId", userSelect)
  if (!guard) throw new ApiError(404, "Security guard not found.")
  if (!guard.userId || guard.userId.role !== ROLES.SECURITY_GUARD) {
    throw new ApiError(409, "The linked user no longer has the Security Guard role.")
  }
  return guard
}

function assertDetailAccess(guard, requester) {
  if ([ROLES.COMMITTEE_HEAD, ROLES.COMMITTEE_MEMBER].includes(requester.role)) return
  const guardUserId = guard.userId?._id || guard.userId
  if (requester.role !== ROLES.SECURITY_GUARD || guardUserId.toString() !== requester.userId) {
    throw new ApiError(403, "You can only view your own security guard profile.")
  }
}

async function synchronizeUserStatus(userId, status, session) {
  const isActive = status === "Active"
  const operation = { $set: { isActive } }
  if (!isActive) operation.$unset = { refreshToken: "", sessionId: "" }
  await User.updateOne({ _id: userId }, operation, { session })
}

function shiftFields(shift) {
  const schedule = SECURITY_GUARD_SHIFTS[shift]
  if (!schedule) throw new ApiError(400, "Invalid security guard shift.")
  return { shift, shiftStartTime: schedule.startTime, shiftEndTime: schedule.endTime }
}

export async function createSecurityGuard(data) {
  try {
    const guardId = await withTransaction(async (session) => {
      const user = await requireGuardUser(data.userId, session)
      const employeeId = data.employeeId.trim().toUpperCase()
      if (await SecurityGuard.exists({ userId: user._id }).session(session)) {
        throw new ApiError(409, "This user already has a security guard profile and active shift.")
      }
      if (await SecurityGuard.exists({ employeeId }).session(session)) {
        throw new ApiError(409, "Employee ID already exists.")
      }
      const [guard] = await SecurityGuard.create([{
        userId: user._id,
        employeeId,
        gate: data.gate,
        ...shiftFields(data.shift),
        joiningDate: data.joiningDate,
        contactNumber: data.contactNumber,
        emergencyContact: data.emergencyContact,
        status: data.status || "Active",
      }], { session })
      await synchronizeUserStatus(user._id, guard.status, session)
      return guard._id
    })
    return requireGuard(guardId)
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.employeeId) throw new ApiError(409, "Employee ID already exists.")
      throw new ApiError(409, "This user already has a security guard profile.")
    }
    throw error
  }
}

export async function getSecurityGuards(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false }
  if (filters.gate) query.gate = filters.gate
  if (filters.shift) query.shift = filters.shift
  if (filters.status) query.status = filters.status

  const validUserQuery = { role: ROLES.SECURITY_GUARD, isDeleted: { $ne: true } }
  const profileSearch = []
  const validUsers = await User.find(validUserQuery).select("_id")
  query.userId = { $in: validUsers.map((user) => user._id) }
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(escaped, "i")
    const matchingUsers = await User.find({
      ...validUserQuery,
      $or: [{ firstName: pattern }, { lastName: pattern }, { email: pattern }, { phone: pattern }],
    }).select("_id")
    profileSearch.push({ employeeId: pattern }, { contactNumber: pattern })
    query.$and = [{
      $or: [{ userId: { $in: matchingUsers.map((user) => user._id) } }, ...profileSearch],
    }]
  }

  const sortFields = new Set(["employeeId", "gate", "shift", "joiningDate", "status", "createdAt", "updatedAt"])
  const sortBy = sortFields.has(filters.sortBy) ? filters.sortBy : "employeeId"
  const sortOrder = filters.sortOrder === "desc" ? -1 : 1
  const [guards, total] = await Promise.all([
    SecurityGuard.find(query).populate("userId", userSelect).sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit).limit(limit),
    SecurityGuard.countDocuments(query),
  ])
  return { guards, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getSecurityGuardById(id, requester) {
  const guard = await requireGuard(id)
  assertDetailAccess(guard, requester)
  return guard
}

export async function updateSecurityGuard(id, data) {
  const guard = await requireGuard(id)
  await requireGuardUser(guard.userId._id)
  const updates = { ...data }
  delete updates.userId
  if (updates.employeeId) {
    updates.employeeId = updates.employeeId.trim().toUpperCase()
    if (await SecurityGuard.exists({ employeeId: updates.employeeId, _id: { $ne: id } })) {
      throw new ApiError(409, "Employee ID already exists.")
    }
  }
  if (updates.shift) Object.assign(updates, shiftFields(updates.shift))

  try {
    if (updates.status && updates.status !== guard.status) {
      await withTransaction(async (session) => {
        await SecurityGuard.updateOne({ _id: id }, { $set: updates }, { session, runValidators: true })
        await synchronizeUserStatus(guard.userId._id, updates.status, session)
      })
    } else {
      await SecurityGuard.updateOne({ _id: id }, { $set: updates }, { runValidators: true })
    }
    return requireGuard(id)
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Employee ID already exists.")
    throw error
  }
}

export function setSecurityGuardStatus(id, status) {
  return updateSecurityGuard(id, { status })
}

export async function removeSecurityGuard(id) {
  const guard = await requireGuard(id)
  await withTransaction(async (session) => {
    await SecurityGuard.updateOne(
      { _id: id },
      { $set: { isDeleted: true, deletedAt: new Date(), status: "Inactive" } },
      { session }
    )
    await synchronizeUserStatus(guard.userId._id, "Inactive", session)
  })
}
