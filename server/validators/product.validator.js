export const productValidator = [
  (req) => (!req.body.name ? "Product name is required." : null),
  (req) => (!req.body.category ? "Category is required." : null),
  (req) => (req.body.price === undefined ? "Price is required." : null),
  (req) => (Number(req.body.price) < 0 ? "Price must be positive." : null),
  (req) => (!req.body.description ? "Description is required." : null),
];
