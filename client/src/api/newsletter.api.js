import { apiRequest } from "./axios";

export const subscribeNewsletterRequest = (email, source = "footer") =>
  apiRequest("/newsletter/subscribe", {
    method: "POST",
    body: { email, source },
  });

export const unsubscribeNewsletterRequest = ({ email, token }) =>
  apiRequest("/newsletter/unsubscribe", {
    method: "POST",
    body: { email, token },
  });

export const verifyUnsubscribeTokenRequest = (email, token) =>
  apiRequest(`/newsletter/verify-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token || "")}`, {
    method: "GET",
  });

export const getNewsletterSubscribersRequest = () =>
  apiRequest("/newsletter");

export const sendNewsletterRequest = ({ subject, html }) =>
  apiRequest("/newsletter/send", {
    method: "POST",
    body: { subject, html },
  });

export const toggleSubscriberStatusRequest = (id) =>
  apiRequest(`/newsletter/${id}/status`, {
    method: "PATCH",
  });

export const deleteSubscriberRequest = (id) =>
  apiRequest(`/newsletter/${id}`, {
    method: "DELETE",
  });

export const adminAddSubscriberRequest = (email) =>
  apiRequest("/newsletter/admin-add", {
    method: "POST",
    body: { email },
  });
