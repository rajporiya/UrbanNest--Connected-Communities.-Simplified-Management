import { validationResult } from "express-validator"

import AppError from "../utils/AppError.js"

function validateRequest(req, res, next) {
  const errors = validationResult(req)

  if (errors.isEmpty()) {
    return next()
  }

  return next(new AppError(errors.array()[0]?.msg || "Validation failed", 400))
}

export default validateRequest
