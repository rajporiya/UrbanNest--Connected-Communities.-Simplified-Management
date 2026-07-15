import User from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"
import { sendResetPasswordEmail, sendVerificationEmail } from "./email.service.js"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js"
import { comparePassword, hashPassword } from "../utils/password.util.js"
import crypto from "crypto"

import ROLES, { DEFAULT_ROLE } from "../config/roles.js"
import {
  deleteCloudinaryImage,
  uploadProfileImageToCloudinary,
} from "./profile-image.service.js"

async function createUser(userData) {
  return User.create(userData)
}

async function findUserByEmail(email, options = {}) {
  const query = User.findOne({ email: email?.toLowerCase() })

  if (options.includePassword) {
    query.select("+password")
  }

  return query
}

async function findUserById(id, options = {}) {
  const query = User.findById(id)

  if (options.includePassword) {
    query.select("+password")
  }

  return query
}

async function updateUser(id, updateData) {
  const user = await User.findById(id)

  if (!user) {
    return null
  }

  Object.assign(user, updateData)
  return user.save()
}

async function deactivateUser(id) {
  return User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true }
  )
}

async function registerUser(userData) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role,
    profileImage,
    isActive,
    isEmailVerified,
  } = userData

  const normalizedEmail = email?.trim().toLowerCase()
  const normalizedPhone = phone?.trim()

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
    firstName: firstName?.trim(),
    lastName: lastName?.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    role: role?.trim() || DEFAULT_ROLE,
    profileImage:
      typeof profileImage === "string"
        ? { public_id: null, secure_url: profileImage }
        : profileImage || { public_id: null, secure_url: "" },
    isActive: typeof isActive === "boolean" ? isActive : true,
    isEmailVerified: typeof isEmailVerified === "boolean" ? isEmailVerified : false,
  }

  delete userPayload.confirmPassword
  void confirmPassword

  const createResult = await User.collection.insertOne(userPayload)
  const createdUser = await findUserById(createResult.insertedId)

  if (!createdUser) {
    throw new ApiError(500, "User registration failed.")
  }

  return createdUser
}

function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex")
}

function hashSessionId(sessionId) {
  return crypto.createHash("sha256").update(sessionId).digest("hex")
}

async function createSessionTokens(user, sessionId) {
  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    sessionId,
  }

  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(tokenPayload),
    generateRefreshToken({ userId: tokenPayload.userId, sessionId }),
  ])

  return { accessToken, refreshToken }
}

// Some early accounts were inserted directly with the misspelled role
// "Committe Head". Normalize it before creating a JWT so the account receives
// the same permissions as every other Committee Head.
function normalizeRole(role) {
  return String(role || "").trim().toLowerCase() === "committe head"
    ? ROLES.COMMITTEE_HEAD
    : role
}

async function loginUser(loginData, sessionData = {}) {
  const { email, password } = loginData

  const normalizedEmail = email?.trim().toLowerCase()
  const user = await findUserByEmail(normalizedEmail, { includePassword: true })

  if (!user) {
    throw new ApiError(401, "Invalid credentials.")
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is inactive.")
  }

  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials.")
  }

  const normalizedRole = normalizeRole(user.role)
  if (normalizedRole !== user.role) {
    await User.updateOne({ _id: user._id }, { $set: { role: normalizedRole } })
    user.role = normalizedRole
  }

  const sessionId = crypto.randomBytes(32).toString("hex")
  const { accessToken, refreshToken } = await createSessionTokens(user, sessionId)
  const loginAt = new Date()
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: hashRefreshToken(refreshToken),
        sessionId: hashSessionId(sessionId),
        lastLoginAt: loginAt,
        lastLoginIP: String(sessionData.ip || "").slice(0, 64) || null,
        lastUserAgent: String(sessionData.userAgent || "").slice(0, 512) || null,
      },
    },
    { new: true, runValidators: true }
  )

  if (!updatedUser) {
    throw new ApiError(500, "Unable to create login session.")
  }

  const sanitizedUser = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser }
  delete sanitizedUser.password
  delete sanitizedUser.refreshToken

  return {
    accessToken,
    refreshToken,
    user: sanitizedUser,
  }
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== "string") {
    throw new ApiError(400, "Refresh token is required.")
  }

  let decodedToken

  try {
    decodedToken = await verifyRefreshToken(refreshToken)
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token.")
  }

  const userId = decodedToken.userId || decodedToken.sub
  const sessionId = decodedToken.sessionId

  if (!userId || !sessionId) {
    throw new ApiError(401, "Invalid refresh token payload.")
  }

  const storedTokenHash = hashRefreshToken(refreshToken)
  const storedSessionId = hashSessionId(sessionId)
  const user = await User.findOne({
    _id: userId,
    refreshToken: storedTokenHash,
    sessionId: storedSessionId,
  })

  if (!user || !user.isActive) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked.")
  }

  const tokens = await createSessionTokens(user, sessionId)
  const rotatedUser = await User.findOneAndUpdate(
    { _id: user._id, refreshToken: storedTokenHash, sessionId: storedSessionId },
    { $set: { refreshToken: hashRefreshToken(tokens.refreshToken) } },
    { new: true }
  )

  if (!rotatedUser) {
    throw new ApiError(401, "Refresh token has already been used or revoked.")
  }

  return tokens
}

async function validateActiveSession(userId, sessionId) {
  if (!userId || !sessionId) {
    return false
  }

  const user = await User.findOne({
    _id: userId,
    sessionId: hashSessionId(sessionId),
    refreshToken: { $exists: true, $ne: null },
    isActive: true,
  }).select("_id")

  return Boolean(user)
}

async function logoutUser(userId, sessionId) {
  if (!userId || !sessionId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, sessionId: hashSessionId(sessionId) },
    {
      $unset: { refreshToken: "", sessionId: "" },
      $set: { lastLogoutAt: new Date() },
    },
    { new: true }
  )

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  return { message: "Logout successful." }
}

async function getLoggedInUserProfile(userId) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  const user = await findUserById(userId)

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  const profile = user.toObject ? user.toObject() : { ...user }

  return {
    id: profile._id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    profileImage: profile.profileImage,
    role: profile.role,
    isActive: profile.isActive,
    isEmailVerified: profile.isEmailVerified,
    createdAt: profile.createdAt,
  }
}

async function forgotPasswordUser(email) {
  const normalizedEmail = email?.trim().toLowerCase()
  const user = await findUserByEmail(normalizedEmail)

  if (!user) {
    return {
      message: "If an account exists, a password reset link has been sent.",
    }
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)

  await updateUser(user._id, {
    passwordResetToken,
    passwordResetExpires,
  })

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

  await sendResetPasswordEmail({
    to: user.email,
    firstName: user.firstName,
    resetUrl,
    expiresInMinutes: 15,
  })

  return {
    message: "If an account exists, a password reset link has been sent.",
  }
}

function serializeUserProfile(user) {
  const profile = user.toObject ? user.toObject() : { ...user }

  return {
    id: profile._id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    profileImage: profile.profileImage || { public_id: null, secure_url: "" },
    role: profile.role,
    isActive: profile.isActive,
    isEmailVerified: profile.isEmailVerified,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}

async function getMyProfile(userId) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  const user = await findUserById(userId)

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  return serializeUserProfile(user)
}

async function updateMyProfile(userId, profileData) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  const allowedFields = ["firstName", "lastName", "phone", "profileImage"]
  const updates = Object.fromEntries(
    Object.entries(profileData).filter(([key]) => allowedFields.includes(key))
  )

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "At least one profile field is required.")
  }

  if (updates.phone) {
    const existingPhoneUser = await User.findOne({
      phone: updates.phone,
      _id: { $ne: userId },
    }).lean()

    if (existingPhoneUser) {
      throw new ApiError(409, "Phone number already exists.")
    }
  }

  if (typeof updates.profileImage === "string") {
    updates.profileImage = { public_id: null, secure_url: updates.profileImage }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  )

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  return serializeUserProfile(user)
}

async function uploadMyProfileImage(userId, file) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  if (!file?.buffer) {
    throw new ApiError(400, "Profile image is required.")
  }

  const currentUser = await findUserById(userId)

  if (!currentUser) {
    throw new ApiError(404, "User not found.")
  }

  const uploadedImage = await uploadProfileImageToCloudinary(file.buffer, userId)
  let updatedUser

  try {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profileImage: {
            public_id: uploadedImage.public_id,
            secure_url: uploadedImage.secure_url,
          },
        },
      },
      { new: true, runValidators: true }
    )
  } catch (error) {
    await deleteCloudinaryImage(uploadedImage.public_id).catch(() => null)
    throw error
  }

  if (!updatedUser) {
    await deleteCloudinaryImage(uploadedImage.public_id).catch(() => null)
    throw new ApiError(404, "User not found.")
  }

  const oldPublicId = currentUser.profileImage?.public_id

  if (oldPublicId && oldPublicId !== uploadedImage.public_id) {
    await deleteCloudinaryImage(oldPublicId)
  }

  return serializeUserProfile(updatedUser)
}

async function generateEmailVerificationToken(userId) {
  const user = await findUserById(userId)

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email address is already verified.")
  }

  const verificationToken = crypto.randomBytes(32).toString("hex")
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await User.findByIdAndUpdate(user._id, {
    $set: { emailVerificationToken, emailVerificationExpires },
  })

  return { user, verificationToken }
}

async function sendUserVerificationEmail(userId) {
  const { user, verificationToken } = await generateEmailVerificationToken(userId)
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`
  const verificationUrl = `${apiUrl}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`

  await sendVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    verificationUrl,
    expiresInHours: 24,
  })
}

async function verifyUserEmail(verificationToken) {
  if (!verificationToken || typeof verificationToken !== "string") {
    throw new ApiError(400, "Verification token is required.")
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
  const user = await User.findOne({ emailVerificationToken: hashedToken })
    .select("+emailVerificationToken +emailVerificationExpires")

  if (!user) {
    throw new ApiError(400, "Invalid verification token.")
  }

  if (!user.emailVerificationExpires || user.emailVerificationExpires <= new Date()) {
    throw new ApiError(400, "Verification token has expired.")
  }

  const verifiedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    },
    {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: "", emailVerificationExpires: "" },
    },
    { new: true, runValidators: true }
  )

  if (!verifiedUser) {
    throw new ApiError(400, "Verification token is invalid or has expired.")
  }

  return { message: "Email verified successfully." }
}

async function resetPasswordUser(resetToken, newPassword) {
  if (!resetToken) {
    throw new ApiError(400, "Reset token is required.")
  }

  if (!newPassword) {
    throw new ApiError(400, "New password is required.")
  }

  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: { $gt: new Date() },
  })

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token.")
  }

  const hashedPassword = await hashPassword(newPassword)

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!updatedUser) {
    throw new ApiError(500, "Password reset failed.")
  }

  return {
    message: "Password reset successfully.",
  }
}

async function changePasswordUser(userId, currentPassword, newPassword) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access.")
  }

  const user = await findUserById(userId, { includePassword: true })

  if (!user) {
    throw new ApiError(404, "User not found.")
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is inactive.")
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required.")
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect.")
  }

  const isSamePassword = await comparePassword(newPassword, user.password)

  if (isSamePassword) {
    throw new ApiError(400, "New password must be different from current password.")
  }

  const hashedPassword = await hashPassword(newPassword)

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!updatedUser) {
    throw new ApiError(500, "Password change failed.")
  }

  return {
    message: "Password changed successfully.",
  }
}

export {
  createUser,
  deactivateUser,
  findUserByEmail,
  findUserById,
  forgotPasswordUser,
  generateEmailVerificationToken,
  getLoggedInUserProfile,
  getMyProfile,
  loginUser,
  logoutUser,
  refreshUserSession,
  resetPasswordUser,
  changePasswordUser,
  registerUser,
  sendUserVerificationEmail,
  updateUser,
  updateMyProfile,
  uploadMyProfileImage,
  validateActiveSession,
  verifyUserEmail,
}
