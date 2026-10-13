const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status =
    Number.isInteger(error?.status) && error.status >= 400 && error.status < 600
      ? error.status
      : Number.isInteger(error?.statusCode) &&
          error.statusCode >= 400 &&
          error.statusCode < 600
        ? error.statusCode
        : 500;
  const message =
    status === 400
      ? "Invalid request"
      : status === 413
        ? "Request body is too large"
        : status < 500
          ? "Request could not be processed"
          : "Internal server error";

  if (status >= 500) {
    console.error("Unhandled API request error", {
      method: req.method,
      path: req.path,
      status,
    });
  }

  return res.status(status).json({ success: false, message });
};

export default errorMiddleware;