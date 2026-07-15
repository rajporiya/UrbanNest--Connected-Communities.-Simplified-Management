import { body } from "express-validator"

import { validationResultMiddleware } from "./register.validator.js"

export const refreshTokenValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isString()
    .withMessage("Refresh token must be a valid string"),
]

export { validationResultMiddleware }

export default refreshTokenValidation
