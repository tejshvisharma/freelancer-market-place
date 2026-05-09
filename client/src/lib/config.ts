export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  wsUrl: import.meta.env.VITE_WS_URL ?? "http://localhost:8000",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
} as const;