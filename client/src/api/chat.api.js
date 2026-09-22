import { apiRequest } from "./axios";

export const sendChatMessageRequest = (message, history = [], sessionId = null) =>
  apiRequest("/chat", {
    method: "POST",
    body: { message, history, sessionId },
  });

export const getChatHistoryRequest = (sessionId = null) =>
  apiRequest(`/chat/history${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ""}`, {
    method: "GET",
  });

export const clearChatHistoryRequest = (sessionId = null) =>
  apiRequest("/chat/history", {
    method: "DELETE",
    body: { sessionId },
  });
