/**
 * Parses pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {number} defaultLimit - Default items per page
 * @param {number} maxLimit - Maximum items per page
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (
  query,
  defaultLimit = 10,
  maxLimit = 100,
) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(
    1,
    Math.min(maxLimit, Number(query.limit) || defaultLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Creates pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
export const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
