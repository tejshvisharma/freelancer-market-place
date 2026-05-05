class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 400 - Bad Request
class BadRequestError extends ApiError {
  constructor(message = "Bad Request", errors = []) {
    super(400, message, errors);
  }
}

// 401 - Unauthorized
class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized access") {
    super(401, message);
  }
}

// 403 - Forbidden
class ForbiddenError extends ApiError {
  constructor(message = "Forbidden - You don't have permission") {
    super(403, message);
  }
}

// 404 - Not Found
class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

// 409 - Conflict
class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}

// 422 - Validation Error
class ValidationError extends ApiError {
  constructor(errors = [], message = "Validation failed") {
    super(422, message, errors);
  }
}

// 429 - Too Many Requests
class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests, please try again later") {
    super(429, message);
  }
}

// 500 - Internal Server Error
class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message);
  }
}

// 503 - Service Unavailable
class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(503, message);
  }
}

export {
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
