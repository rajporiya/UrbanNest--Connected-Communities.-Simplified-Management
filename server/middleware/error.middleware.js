import mongoose from "mongoose"
import jsonwebtoken from "jsonwebtoken"

import AppError from "../utils/AppError.js"
import { errorResponse } from "../utils/response.util.js"

const { JsonWebTokenError, TokenExpiredError } = jsonwebtoken

function buildErrorPayload(message, errors = [], statusCode = 500, stack = null) {
  const responseErrors = Array.isArray(errors) ? [...errors] : [errors]

  if (stack && process.env.NODE_ENV === "development") {
    responseErrors.push(stack)
  }

  return {
    message,
    errors: responseErrors,
    statusCode,
  }
}

function handleMongoValidationError(error) {
  const messages = Object.values(error.errors || {}).map((item) => item.message)

  return buildErrorPayload("Validation failed", messages, 400, error.stack)
}

function handleDuplicateKeyError(error) {
  const field = Object.keys(error.keyValue || {})[0]
  const value = field ? error.keyValue[field] : undefined
  const message = field
    ? `${field} already exists${value !== undefined ? ` (${value})` : ""}`
    : "Duplicate key error"

  return buildErrorPayload(message, [message], 409, error.stack)
}

function handleCastError(error) {
  const message = `${error.value} is not a valid ${error.path}`

  return buildErrorPayload(message, [message], 400, error.stack)
}

function handleJwtError(error) {
  if (error instanceof TokenExpiredError) {
    return buildErrorPayload("JWT token has expired", ["Token expired"], 401, error.stack)
  }

  if (error instanceof JsonWebTokenError) {
    return buildErrorPayload("Invalid JWT token", ["Invalid token"], 401, error.stack)
  }

  return buildErrorPayload("Unauthorized access", [error.message || "Unauthorized access"], 401, error.stack)
}

function handleValidationError(error) {
  if (error instanceof mongoose.Error.ValidationError) {
    return handleMongoValidationError(error)
  }

  if (error.name === "ValidationError" && error.errors) {
    const messages = Array.isArray(error.errors)
      ? error.errors
      : Object.values(error.errors).map((item) => item.message || item.msg || item)

    return buildErrorPayload("Validation failed", messages, 400, error.stack)
  }

  return null
}

function errorMiddleware(error, req, res, next) {
  const validationError = handleValidationError(error)

  if (validationError) {
    return errorResponse(
      res,
      validationError.message,
      validationError.errors,
      validationError.statusCode
    )
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    const jwtError = handleJwtError(error)
    return errorResponse(res, jwtError.message, jwtError.errors, jwtError.statusCode)
  }

  if (error?.name === "CastError" || error instanceof mongoose.Error.CastError) {
    const castError = handleCastError(error)
    return errorResponse(res, castError.message, castError.errors, castError.statusCode)
  }

  if (error?.code === 11000) {
    const duplicateKeyError = handleDuplicateKeyError(error)
    return errorResponse(
      res,
      duplicateKeyError.message,
      duplicateKeyError.errors,
      duplicateKeyError.statusCode
    )
  }

  if (error instanceof AppError || error?.isOperational) {
    return errorResponse(
      res,
      error.message || "Application error",
      error.errors || [error.message || "Application error"],
      error.statusCode || 500
    )
  }

  return errorResponse(
    res,
    "Internal Server Error",
    process.env.NODE_ENV === "development" ? [error?.stack || error?.message || "Unknown error"] : [],
    500
  )
}

export default errorMiddleware
