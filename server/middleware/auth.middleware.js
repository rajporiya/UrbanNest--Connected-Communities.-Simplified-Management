import sendResponse from "../utils/response.js"
import { verifyAccessToken } from "../utils/jwt.util.js"

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null
  }

  const [scheme, token] = authorizationHeader.split(" ")

  if (scheme !== "Bearer" || !token) {
    return null
  }

  return token
}

function getUnauthorizedMessage(error) {
  if (error?.message === "Access token has expired") {
    return "Token has expired"
  }

  if (error?.message?.startsWith("Invalid access token")) {
    return "Invalid token"
  }

  return "Unauthorized access"
}

function normalizeUserPayload(decodedToken) {
  if (!decodedToken || typeof decodedToken !== "object") {
    return null
  }

  return decodedToken
}

async function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization)

    if (!token) {
      return sendResponse(res, 401, "Missing token")
    }

    const decodedToken = await verifyAccessToken(token)
    const authenticatedUser = normalizeUserPayload(decodedToken)

    if (!authenticatedUser) {
      return sendResponse(res, 403, "Unauthorized access")
    }

    req.user = authenticatedUser
    return next()
  } catch (error) {
    const message = getUnauthorizedMessage(error)
    const statusCode = message === "Unauthorized access" ? 403 : 401

    return sendResponse(res, statusCode, message)
  }
}

export default authMiddleware
