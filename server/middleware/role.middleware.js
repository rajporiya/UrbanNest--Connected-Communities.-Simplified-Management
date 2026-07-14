import sendResponse from "../utils/response.js"
import { ALL_ROLES } from "../config/roles.js"

function authorize(...roles) {
  const allowedRoles = roles.filter((role) => ALL_ROLES.includes(role))

  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 403, "Forbidden")
    }

    if (!allowedRoles.length || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, "Forbidden")
    }

    return next()
  }
}

export default authorize
