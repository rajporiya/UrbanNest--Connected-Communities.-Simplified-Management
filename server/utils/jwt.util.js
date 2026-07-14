import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRES_IN = "15m"
const REFRESH_TOKEN_EXPIRES_IN = "7d"
const TOKEN_ISSUER = "urban-nest-api"
const TOKEN_AUDIENCE = "urban-nest-client"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }

  return secret
}

function getRefreshTokenSecret() {
  const secret = process.env.REFRESH_TOKEN_SECRET

  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured")
  }

  if (secret === getJwtSecret()) {
    throw new Error("REFRESH_TOKEN_SECRET must be different from JWT_SECRET")
  }

  return secret
}

// Generate a signed access token for the provided payload.
export async function generateAccessToken(payload) {
  try {
    const secret = getJwtSecret()
    return await Promise.resolve(
      jwt.sign({ ...payload, tokenType: "access" }, secret, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
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

    const decodedToken = await Promise.resolve(
      jwt.verify(token, secret, {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      })
    )

    if (decodedToken.tokenType !== "access") {
      throw new Error("Invalid access token type")
    }

    return decodedToken
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired")
    }

    throw new Error(`Invalid access token: ${error.message}`)
  }
}

export async function generateRefreshToken(payload) {
  try {
    const secret = getRefreshTokenSecret()

    return await Promise.resolve(
      jwt.sign({ ...payload, tokenType: "refresh" }, secret, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      })
    )
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`)
  }
}

export async function verifyRefreshToken(token) {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Refresh token is required")
    }

    const decodedToken = await Promise.resolve(
      jwt.verify(token, getRefreshTokenSecret(), {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      })
    )

    if (decodedToken.tokenType !== "refresh") {
      throw new Error("Invalid refresh token type")
    }

    return decodedToken
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired")
    }

    throw new Error(`Invalid refresh token: ${error.message}`)
  }
}
