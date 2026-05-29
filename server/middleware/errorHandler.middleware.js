export const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = error.status || error.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Server error."
      : error.message || "Server error.";

  res.status(status).json({ success: false, message });
};
