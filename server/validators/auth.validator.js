export const registerValidator = [
  (req) => (!req.body.name ? "Name is required." : null),
  (req) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email || "") ? "Valid email is required." : null),
  (req) => (!req.body.password || req.body.password.length < 8 ? "Password must be at least 8 characters." : null),
];

export const loginValidator = [
  (req) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email || "") ? "Valid email is required." : null),
  (req) => (!req.body.password ? "Password is required." : null),
];
