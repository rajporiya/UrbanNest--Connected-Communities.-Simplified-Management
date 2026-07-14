import crypto from "crypto"

import ROLES from "../config/roles.js"
import User from "../models/User.js"
import ApiError from "../utils/ApiError.js"
import { hashPassword } from "../utils/password.util.js"
import { sendAccountCredentialsEmail } from "./email.service.js"
import { deleteCloudinaryImage } from "./profile-image.service.js"

const MANAGED_ROLES = [ROLES.COMMITTEE_MEMBER, ROLES.RESIDENT, ROLES.SECURITY_GUARD]
const SORT_FIELDS = new Set([
  "firstName", "lastName", "email", "phone", "role", "tower", "floor", "flat", "createdAt", "updatedAt",
])

function serializeUser(user) {
  const value = user.toObject ? user.toObject() : { ...user }

  return {
    id: value._id,
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    phone: value.phone,
    profileImage: value.profileImage || { public_id: null, secure_url: "" },
    role: value.role,
    tower: value.tower,
    floor: value.floor,
    flat: value.flat,
    isActive: value.isActive,
    isEmailVerified: value.isEmailVerified,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function ensureManagedRole(role) {
  if (!MANAGED_ROLES.includes(role)) {
    throw new ApiError(400, "Role must be Committee Member, Resident, or Security Guard.")
  }
}

function ensureManageableUser(user, actorUserId) {
  if (!user || user.isDeleted) throw new ApiError(404, "User not found.")
  if (user.role === ROLES.COMMITTEE_HEAD) {
    throw new ApiError(403, "Committee Head accounts cannot be managed from this module.")
  }
  if (actorUserId && user._id.toString() === actorUserId.toString()) {
    throw new ApiError(403, "You cannot manage your own account from this module.")
  }
}

function generateTemporaryPassword() {
  return `Un!${crypto.randomBytes(9).toString("base64url")}9a`
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function createManagedUser(userData) {
  ensureManagedRole(userData.role)
  const email = userData.email.trim().toLowerCase()
  const phone = userData.phone.trim()

  if (await User.exists({ email })) throw new ApiError(409, "Email already exists.")
  if (await User.exists({ phone })) throw new ApiError(409, "Phone number already exists.")

  const accountPassword = userData.password || generateTemporaryPassword()
  const now = new Date()
  const result = await User.collection.insertOne({
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email,
    phone,
    password: await hashPassword(accountPassword),
    profileImage: { public_id: null, secure_url: userData.profileImage || "" },
    role: userData.role,
    tower: userData.tower?.trim() || "",
    floor: userData.floor?.trim() || "",
    flat: userData.flat?.trim() || "",
    isActive: true,
    isEmailVerified: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  const user = await User.findById(result.insertedId)

  if (!user) throw new ApiError(500, "User creation failed.")

  await sendAccountCredentialsEmail({
    to: user.email,
    firstName: user.firstName,
    temporaryPassword: accountPassword,
  })

  return serializeUser(user)
}

export async function getManagedUsers(filters) {
  const page = Number(filters.page) || 1
  const limit = Math.min(Number(filters.limit) || 10, 100)
  const query = { isDeleted: false, role: { $in: MANAGED_ROLES } }

  for (const field of ["tower", "floor", "flat"]) {
    if (filters[field]) query[field] = filters[field]
  }
  if (filters.role) {
    ensureManagedRole(filters.role)
    query.role = filters.role
  }
  if (filters.isActive !== undefined) query.isActive = filters.isActive === "true"
  if (filters.isEmailVerified !== undefined) {
    query.isEmailVerified = filters.isEmailVerified === "true"
  }
  if (filters.search) {
    const pattern = new RegExp(escapeRegex(filters.search.trim()), "i")
    query.$or = ["firstName", "lastName", "email", "phone"].map((field) => ({ [field]: pattern }))
  }

  const sortBy = SORT_FIELDS.has(filters.sortBy) ? filters.sortBy : "createdAt"
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1
  const [users, total] = await Promise.all([
    User.find(query).sort({ [sortBy]: sortOrder }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ])

  return {
    users: users.map(serializeUser),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getManagedUserById(userId) {
  const user = await User.findById(userId)
  ensureManageableUser(user)
  return serializeUser(user)
}

export async function updateManagedUser(userId, updateData, actorUserId) {
  const currentUser = await User.findById(userId)
  ensureManageableUser(currentUser, actorUserId)
  if (updateData.role) ensureManagedRole(updateData.role)

  if (updateData.phone && await User.exists({ phone: updateData.phone, _id: { $ne: userId } })) {
    throw new ApiError(409, "Phone number already exists.")
  }

  const allowed = new Set([
    "firstName", "lastName", "phone", "profileImage", "role", "tower", "floor", "flat", "isActive",
  ])
  const updates = Object.fromEntries(Object.entries(updateData).filter(([key]) => allowed.has(key)))
  if (typeof updates.profileImage === "string") {
    updates.profileImage = { public_id: null, secure_url: updates.profileImage }
  }

  const operation = { $set: updates }
  if (updates.isActive === false) operation.$unset = { refreshToken: "", sessionId: "" }
  const user = await User.findByIdAndUpdate(userId, operation, { new: true, runValidators: true })

  const oldPublicId = currentUser.profileImage?.public_id
  if (updateData.profileImage && oldPublicId) await deleteCloudinaryImage(oldPublicId)
  return serializeUser(user)
}

export function setManagedUserStatus(userId, isActive, actorUserId) {
  return updateManagedUser(userId, { isActive }, actorUserId)
}

export async function softDeleteManagedUser(userId, actorUserId) {
  const user = await User.findById(userId)
  ensureManageableUser(user, actorUserId)
  const deletedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: { isDeleted: true, isActive: false, deletedAt: new Date() },
      $unset: { refreshToken: "", sessionId: "" },
    },
    { new: true }
  )
  return serializeUser(deletedUser)
}
