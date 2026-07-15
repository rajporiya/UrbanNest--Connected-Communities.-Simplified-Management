import User from "../models/User.model.js"
import ROLES, { DEFAULT_ROLE } from "../config/roles.js"
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { hashPassword } from "../utils/password.util.js"
import { successResponse } from "../utils/response.util.js"
import {
  changePasswordUser,
  forgotPasswordUser,
  findUserByEmail,
  findUserById,
  getLoggedInUserProfile,
  loginUser,
  logoutUser,
  refreshUserSession,
  resetPasswordUser,
  sendUserVerificationEmail,
  verifyUserEmail,
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
    tower,
    flat,
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
    tower: typeof tower === "string" ? tower.trim() : "",
    flat: typeof flat === "string" ? flat.trim() : "",
    isActive: true,
    isEmailVerified: false,
  }

  const createResult = await User.collection.insertOne(userPayload)
  const registeredUser = await findUserById(createResult.insertedId)

  if (!registeredUser) {
    throw new ApiError(500, "Registration failed.")
  }

  // Account creation must not be reported as failed solely because the optional
  // verification-email provider is unavailable. The user has already been saved
  // at this point and can verify later.
  try {
    await sendUserVerificationEmail(registeredUser._id)
  } catch (error) {
    console.error("Unable to send registration verification email:", error.message)
  }

  return successResponse(
    res,
    "Registration completed successfully.",
    { user: registeredUser },
    201
  )
})

export const login = asyncHandler(async (req, res) => {
  const loginResult = await loginUser(req.body, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  })

  return successResponse(res, "Login successful.", loginResult)
})

export const profile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id || req.user?._id
  const userProfile = await getLoggedInUserProfile(userId)

  return successResponse(res, "Profile fetched successfully.", { user: userProfile })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordUser(req.body.email)

  return successResponse(res, result.message, null, 200)
})

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await resetPasswordUser(req.body.token, req.body.newPassword)

  return successResponse(res, result.message, null, 200)
})

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id || req.user?._id
  const result = await changePasswordUser(
    userId,
    req.body.currentPassword,
    req.body.newPassword
  )

  return successResponse(res, result.message, null, 200)
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await verifyUserEmail(req.query.token)

  return successResponse(res, result.message, null, 200)
})

export const refreshToken = asyncHandler(async (req, res) => {
  const tokens = await refreshUserSession(req.body.refreshToken)

  return successResponse(res, "Session refreshed successfully.", tokens, 200)
})

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.id || req.user?._id
  const result = await logoutUser(userId, req.user?.sessionId)

  return successResponse(res, result.message, null, 200)
})
