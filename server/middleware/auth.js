import AppError from "../utils/AppError.js"
import { verifyJwt } from "../utils/jwt.js"
import { findUserById } from "../services/user.service.js"

async function protect(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401))
  }

  try {
    const token = authHeader.split(" ")[1]
    const decoded = verifyJwt(token)
    const userId = decoded.sub || decoded.id || decoded.userId

    if (!userId) {
      return next(new AppError("Invalid token payload", 401))
    }

    const user = await findUserById(userId, { includePassword: false })

    if (!user || !user.isActive) {
      return next(new AppError("User not found or inactive", 401))
    }

    req.user = user
    return next()
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401))
  }
}

export default protect
