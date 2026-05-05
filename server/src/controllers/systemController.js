import { ApiError, NotFoundError } from "../utils/api-error.js";
import { successResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
  return successResponse(res, "Server is healthy", {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const testError = asyncHandler(async (req, res, next) => {
  if (process.env.NODE_ENV !== "development") {
    return next(new NotFoundError("Route not found"));
  }

  return next(
    new ApiError(400, "This is a test error", [
      { field: "test", message: "Testing error handling" },
    ]),
  );
});

export { healthCheck, testError };
