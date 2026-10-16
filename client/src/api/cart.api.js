import { apiRequest } from "./axios";

export const getCartRequest = () => apiRequest("/cart");
export const updateCartRequest = (payload) => {
  const body = Array.isArray(payload) ? { items: payload } : payload;
  return apiRequest("/cart", { method: "PUT", body });
};
