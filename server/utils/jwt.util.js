import jwt from "jsonwebtoken"

const DEFAULT_EXPIRES_IN = "7d"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }

  return secret
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN
}

// Generate a signed access token for the provided payload.
export async function generateAccessToken(payload) {
  try {
    const secret = getJwtSecret()
    const expiresIn = getJwtExpiresIn()

    return await Promise.resolve(
      jwt.sign(payload, secret, {
        expiresIn,
      })
    )
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`)
  }
}

// Verify an access token and return the decoded payload.
export async function verifyAccessToken(token) {
  try {
    const secret = getJwtSecret()

    if (!token || typeof token !== "string") {
      throw new Error("Token is required")
    }

    return await Promise.resolve(jwt.verify(token, secret))
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired")
    }

    throw new Error(`Invalid access token: ${error.message}`)
  }
}
