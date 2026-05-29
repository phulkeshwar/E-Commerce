export const reviewValidator = [
  (req) => (!req.body.productId ? "Product is required." : null),
  (req) => (!req.body.body ? "Review text is required." : null),
  (req) =>
    req.body.rating && (Number(req.body.rating) < 1 || Number(req.body.rating) > 5)
      ? "Rating must be between 1 and 5."
      : null,
];
