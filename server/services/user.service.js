import User from "../models/User.js"

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

export { createUser, deactivateUser, findUserByEmail, findUserById, updateUser }
