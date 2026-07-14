import bcrypt from "bcrypt"

const SALT_ROUNDS = 12

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export { comparePassword, hashPassword }
