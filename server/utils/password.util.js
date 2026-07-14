import bcrypt from "bcrypt"

const DEFAULT_SALT_ROUNDS = 10

function getSaltRounds() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS)

  if (Number.isInteger(saltRounds) && saltRounds > 0) {
    return saltRounds
  }

  return DEFAULT_SALT_ROUNDS
}

export async function hashPassword(password) {
  try {
    if (!password || typeof password !== "string") {
      throw new Error("Password is required")
    }

    const saltRounds = getSaltRounds()
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`)
  }
}
    
export async function comparePassword(plainPassword, hashedPassword) {
  try {
    if (!plainPassword || typeof plainPassword !== "string") {
      throw new Error("Plain password is required")
    }

    if (!hashedPassword || typeof hashedPassword !== "string") {
      throw new Error("Hashed password is required")
    }

    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    throw new Error(`Failed to compare password: ${error.message}`)
  }
}
