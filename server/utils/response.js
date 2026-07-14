function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    status: statusCode >= 400 ? "error" : "success",
    message,
    data,
  })
}

export default sendResponse
