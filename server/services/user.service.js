import User from "../models/User.js"
import ApiError from "../utils/ApiError.js"
import { hashPassword } from "../utils/password.util.js"

import { DEFAULT_ROLE } from "../config/roles.js"

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
    profileImage: profileImage || "",
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

export { createUser, deactivateUser, findUserByEmail, findUserById, registerUser, updateUser }
