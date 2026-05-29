export const orderValidator = [
  (req) => (!Array.isArray(req.body.items) || req.body.items.length === 0 ? "At least one order item is required." : null),
  (req) => (!req.body.shippingAddress?.name ? "Shipping address is required." : null),
  (req) => (!req.body.shippingAddress?.phone ? "Phone number is required." : null),
  (req) => (!req.body.shippingAddress?.line1 ? "Address line is required." : null),
  (req) => (!req.body.shippingAddress?.city ? "City is required." : null),
  (req) => (!req.body.shippingAddress?.state ? "State is required." : null),
  (req) => (!/^\d{6}$/.test(req.body.shippingAddress?.pincode || "") ? "Valid 6-digit pincode is required." : null),
  (req) =>
    req.body.paymentMethod && !["cod", "upi", "card", "netbanking"].includes(req.body.paymentMethod)
      ? "Invalid payment method."
      : null,
];
