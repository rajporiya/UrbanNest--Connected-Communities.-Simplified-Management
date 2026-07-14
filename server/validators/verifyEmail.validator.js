import { query } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

export const verifyEmailValidation = [
  query("token")
    .trim()
    .notEmpty()
    .withMessage("Verification token is required")
    .matches(/^[a-f0-9]{64}$/i)
    .withMessage("Verification token is invalid"),
]

export { validationResultMiddleware }

export default verifyEmailValidation
