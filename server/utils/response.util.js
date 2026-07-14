function getTimestamp() {
  return new Date().toISOString()
}

function normalizeErrors(errors) {
  if (!errors) {
    return []
  }

  if (Array.isArray(errors)) {
    return errors
  }

  return [errors]
}

// Send a consistent success response across the backend.
export function successResponse(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: getTimestamp(),
  })
}

// Send a consistent error response across the backend.
export function errorResponse(res, message, errors = null, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: normalizeErrors(errors),
    timestamp: getTimestamp(),
  })
}
