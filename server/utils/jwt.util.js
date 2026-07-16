import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRES_IN = "100y"
const REFRESH_TOKEN_EXPIRES_IN = "100y"
const TOKEN_ISSUER = "urban-nest-api"
const TOKEN_AUDIENCE = "urban-nest-client"

function getJwtSecret() {
  // JWT_SECRET_KEY is kept for compatibility with the project's existing .env.
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY

  if (!secret) {
    throw new Error("JWT_SECRET or JWT_SECRET_KEY is not configured")
  }

  return secret
}

function getRefreshTokenSecret() {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET

  if (secret) {
    if (secret === getJwtSecret()) {
      throw new Error("REFRESH_TOKEN_SECRET must be different from JWT_SECRET")
    }

    return secret
  }

  // Older installations have one JWT secret only. Derive a distinct signing
  // key from it so access and refresh tokens are never signed with the same key.
  return `${getJwtSecret()}:refresh`
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
        ignoreExpiration: true,
      })
    )

    if (decodedToken.tokenType !== "access") {
      throw new Error("Invalid access token type")
    }

    return decodedToken
  } catch (error) {
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
        ignoreExpiration: true,
      })
    )

    if (decodedToken.tokenType !== "refresh") {
      throw new Error("Invalid refresh token type")
    }

    return decodedToken
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`)
  }
}
