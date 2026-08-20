// Parse ?page= and ?limit= with sane defaults and caps.
export const getPagination = (req, { limit = 12, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const size = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || limit));
  const skip = (page - 1) * size;
  return { page, limit: size, skip };
};

// Wrap an array + total into the standard paginated envelope.
export const paginated = (items, total, page, limit, extra = {}) => ({
  data: items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasMore: page * limit < total,
  ...extra,
});
