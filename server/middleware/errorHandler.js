function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const status = err.status || "error"

  res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

export default errorHandler