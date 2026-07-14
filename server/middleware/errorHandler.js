import { errorResponse } from "../utils/response.util.js"

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  const errors = err.errors?.length
    ? err.errors
    : process.env.NODE_ENV === "development" && err.stack
      ? [err.stack]
      : []

  return errorResponse(res, message, errors, statusCode)
}

export default errorHandler
