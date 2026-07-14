import User from "../models/User.js"
import ROLES, { DEFAULT_ROLE } from "../config/roles.js"
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { hashPassword } from "../utils/password.util.js"
import sendResponse from "../utils/response.js"
import { successResponse } from "../utils/response.util.js"
import {
  forgotPasswordUser,
  findUserByEmail,
  findUserById,
  getLoggedInUserProfile,
  loginUser,
} from "../services/user.service.js"

export const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role,
  } = req.body

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPhone = phone.trim()
  const selectedRole = role?.trim() || DEFAULT_ROLE

  const existingEmailUser = await findUserByEmail(normalizedEmail)

  if (existingEmailUser) {
    throw new ApiError(409, "Email already exists.")
  }

  const existingPhoneUser = await User.findOne({ phone: normalizedPhone }).lean()

  if (existingPhoneUser) {
    throw new ApiError(409, "Phone number already exists.")
  }

  const hashedPassword = await hashPassword(password)

  const userPayload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    role: Object.values(ROLES).includes(selectedRole) ? selectedRole : DEFAULT_ROLE,
    isActive: true,
    isEmailVerified: false,
  }

  const createResult = await User.collection.insertOne(userPayload)
  const registeredUser = await findUserById(createResult.insertedId)

  if (!registeredUser) {
    throw new ApiError(500, "Registration failed.")
  }

  return successResponse(
    res,
    "Registration completed successfully.",
    { user: registeredUser },
    201
  )
})

export const login = asyncHandler(async (req, res) => {
  const loginResult = await loginUser(req.body)

  return successResponse(res, "Login successful.", loginResult)
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordUser(req.body.email)

  return successResponse(res, result.message, null, 200)
})

function resetPassword(req, res) {
  return sendResponse(res, 200, "Reset password route placeholder")
}

export const profile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id || req.user?._id
  const userProfile = await getLoggedInUserProfile(userId)

  return successResponse(res, "Profile fetched successfully.", { user: userProfile })
})

function changePassword(req, res) {
  return sendResponse(res, 200, "Change password route placeholder")
}

export { changePassword, resetPassword }
