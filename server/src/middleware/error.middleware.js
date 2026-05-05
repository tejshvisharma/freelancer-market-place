import {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
} from "../utils/api-error.js";
import mongoose from "mongoose";

// Mongoose Error Handler
const handleMongooseError = (err) => {
  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    return new ValidationError(errors, "Validation Error");
  }

  // Mongoose Cast Error (Invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    return new BadRequestError(`Invalid ${err.path}: ${err.value}`, [
      {
        field: err.path,
        message: `Invalid format for ${err.path}`,
        value: err.value,
      },
    ]);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000 || err.code === 11001) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new ConflictError("Duplicate field value", [
      {
        field,
        message: `${field} '${value}' already exists`,
        value,
      },
    ]);
  }

  if (
    err?.name === "MongoServerSelectionError" ||
    err?.name === "MongooseServerSelectionError" ||
    err?.code === "ECONNREFUSED"
  ) {
    return new ServiceUnavailableError(
      "Database connection unavailable. Please try again later.",
    );
  }

  return null;
};

// JWT Error Handler
const handleJWTError = (err) => {
  if (err.name === "JsonWebTokenError") {
    return new UnauthorizedError("Invalid token. Please log in again.");
  }

  if (err.name === "TokenExpiredError") {
    return new UnauthorizedError(
      "Your token has expired. Please log in again.",
    );
  }

  return null;
};

// Multer Error Handler
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new BadRequestError("File too large. Maximum size is 5MB", [
      {
        field: "file",
        message: `File size exceeds the maximum limit`,
      },
    ]);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return new BadRequestError("Unexpected file field", [
      {
        field: err.field,
        message: `Unexpected field: ${err.field}`,
      },
    ]);
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return new BadRequestError("Too many files", [
      {
        field: "files",
        message: "Maximum file count exceeded",
      },
    ]);
  }

  return null;
};

const handleRateLimitError = (err) => {
  if (err?.statusCode === 429 || err?.name === "RateLimitError") {
    return new TooManyRequestsError(
      "Too many requests, please try again later",
    );
  }

  return null;
};

const handleHttpStatusError = (err) => {
  const statusCode = err?.statusCode;

  if (!statusCode) {
    return null;
  }

  if (statusCode === 400) {
    return new BadRequestError(err.message || "Bad Request", err.errors || []);
  }

  if (statusCode === 401) {
    return new UnauthorizedError(err.message || "Unauthorized access");
  }

  if (statusCode === 403) {
    return new ForbiddenError(
      err.message || "Forbidden - You don't have permission",
    );
  }

  if (statusCode === 404) {
    return new NotFoundError(err.message || "Resource not found");
  }

  if (statusCode === 409) {
    return new ConflictError(err.message || "Resource already exists");
  }

  if (statusCode === 422) {
    return new ValidationError(
      err.errors || [],
      err.message || "Validation failed",
    );
  }

  if (statusCode === 429) {
    return new TooManyRequestsError(
      err.message || "Too many requests, please try again later",
    );
  }

  if (statusCode === 503) {
    return new ServiceUnavailableError(
      err.message || "Service temporarily unavailable",
    );
  }

  if (statusCode === 500) {
    return new InternalServerError(err.message || "Internal server error");
  }

  return null;
};

const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  return (
    handleMongooseError(err) ||
    handleJWTError(err) ||
    handleMulterError(err) ||
    handleRateLimitError(err) ||
    handleHttpStatusError(err) ||
    new InternalServerError(err.message || "Internal server error")
  );
};

// Production Error Response (Minimal details)
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational || err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      data: null,
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error("ERROR 💥:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      errors:
        process.env.NODE_ENV === "development"
          ? [
              {
                message: err.message,
                stack: err.stack,
              },
            ]
          : [],
      data: null,
    });
  }
};

// Development Error Response (Full details)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    error: err,
    data: null,
  });
};

// Main Global Error Handler Middleware
const globalErrorHandler = (err, req, res, next) => {
  const normalizedError = normalizeError(err);

  // Log error
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} - ${req.method} ${req.originalUrl}:`, {
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    stack:
      process.env.NODE_ENV === "development"
        ? normalizedError.stack
        : undefined,
  });

  // Send response based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(normalizedError, res);
  } else {
    sendErrorProd(normalizedError, res);
  }
};

// 404 Handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route not found: ${req.originalUrl}`);
  error.errors = [
    {
      path: req.originalUrl,
      message: "The requested URL does not exist on this server",
    },
  ];
  next(error);
};

export {
  globalErrorHandler,
  notFoundHandler,
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
};
