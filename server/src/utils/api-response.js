class ApiResponse {
  constructor(statusCode, message, data = null, meta = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  send(res) {
    const response = {
      success: this.success,
      message: this.message,
      data: this.data,
    };

    // Add meta if it has properties
    if (Object.keys(this.meta).length > 0) {
      response.meta = this.meta;
    }

    return res.status(this.statusCode).json(response);
  }
}

// Common response helpers
const successResponse = (
  res,
  message = "Success",
  data = null,
  statusCode = 200,
) => {
  return new ApiResponse(statusCode, message, data).send(res);
};

const createdResponse = (
  res,
  message = "Created successfully",
  data = null,
) => {
  return new ApiResponse(201, message, data).send(res);
};

const paginatedResponse = (
  res,
  message = "Success",
  data = [],
  pagination = {},
) => {
  const meta = {
    pagination: {
      page: parseInt(pagination.page) || 1,
      limit: parseInt(pagination.limit) || 10,
      total: pagination.total || 0,
      pages: Math.ceil(
        (pagination.total || 0) / (parseInt(pagination.limit) || 10),
      ),
      hasNext:
        (parseInt(pagination.page) || 1) <
        Math.ceil((pagination.total || 0) / (parseInt(pagination.limit) || 10)),
      hasPrev: (parseInt(pagination.page) || 1) > 1,
    },
  };

  return new ApiResponse(200, message, data, meta).send(res);
};

export { ApiResponse, successResponse, createdResponse, paginatedResponse };

export default ApiResponse;