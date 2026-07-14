import sendResponse from "../utils/response.js"

function register(req, res) {
  return sendResponse(res, 200, "Register route placeholder")
}

function login(req, res) {
  return sendResponse(res, 200, "Login route placeholder")
}

function forgotPassword(req, res) {
  return sendResponse(res, 200, "Forgot password route placeholder")
}

function resetPassword(req, res) {
  return sendResponse(res, 200, "Reset password route placeholder")
}

function profile(req, res) {
  return sendResponse(res, 200, "Profile route placeholder", {
    user: req.user,
  })
}

function changePassword(req, res) {
  return sendResponse(res, 200, "Change password route placeholder")
}

export { changePassword, forgotPassword, login, profile, register, resetPassword }
