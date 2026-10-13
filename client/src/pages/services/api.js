const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
const defaultApiUrl = import.meta.env.PROD
  ? "/api"
  : "http://localhost:5000/api";

export const API_BASE_URL = (
  configuredApiUrl || defaultApiUrl
).replace(/\/+$/, "");