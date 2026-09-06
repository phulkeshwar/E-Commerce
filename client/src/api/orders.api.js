import { apiRequest } from "./axios";

export const getOrdersRequest = (page = 1, limit = 10) => apiRequest(`/orders?page=${page}&limit=${limit}`);
export const createOrderRequest = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });
export const cancelOrderRequest = (id, guestToken) =>
  apiRequest(`/orders/${id}/cancel`, {
    method: "PATCH",
    headers: guestToken ? { "x-guest-token": guestToken } : undefined,
    body: guestToken ? { guestToken } : undefined,
  });

export const getOrderByIdRequest = (id, guestToken) => {
  const query = guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : "";
  return apiRequest(`/orders/${id}${query}`, {
    headers: guestToken ? { "x-guest-token": guestToken } : undefined,
  });
};
