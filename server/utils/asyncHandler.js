// Wrap async handlers and forward errors to Express error middleware.
export const asyncHandler = (controllerFn) => {
  return (req, res, next) => {
    Promise.resolve(controllerFn(req, res, next)).catch(next)
  }
}

export default asyncHandler
