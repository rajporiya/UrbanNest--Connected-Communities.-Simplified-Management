import jwt from "jsonwebtoken"

import { JWT_CONFIG } from "../config/auth.js"

function signJwt(payload) {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  })
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_CONFIG.secret, { ignoreExpiration: true })
}

export { signJwt, verifyJwt }
