import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const envBaseURLRaw = (import.meta.env.VITE_API_BASE_URL || "").trim();

const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  // If user set the bare Render domain (e.g. https://foo.onrender.com)
  // automatically target the API base path (/api).
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.pathname === "" || url.pathname === "/") {
        url.pathname = "/api";
        return url.toString().replace(/\/+$/, "");
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

const envBaseURL = normalizeApiBaseUrl(envBaseURLRaw);

// If the frontend is served over HTTPS, the browser will block HTTP API calls.
// This often manifests as Axios "Network Error". Prefer HTTPS for deployed backends.
const resolvedEnvBaseURL =
  typeof window !== "undefined" &&
  import.meta.env.PROD &&
  window.location.protocol === "https:" &&
  envBaseURL.startsWith("http://")
    ? envBaseURL.replace(/^http:\/\//i, "https://")
    : envBaseURL;

// In local dev, default to `/api` so Vite can proxy to the backend.
// In production (Vercel), you MUST set VITE_API_BASE_URL to your backend URL (e.g. https://<render>/api)
// otherwise the frontend will call Vercel itself and you will get 404s.
const baseURL = envBaseURL
  ? resolvedEnvBaseURL.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "/api"
    : undefined;

const options = {
  ...(baseURL ? { baseURL } : {}),
  withCredentials: true,
  timeout: 30000,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Axios errors may not have a response (e.g. network error, CORS, timeout).
    const response = axios.isAxiosError(error) ? error.response : undefined;
    const data: any = response?.data;
    const status = response?.status;

    if (import.meta.env.PROD && !envBaseURL) {
      return Promise.reject({
        ...error,
        errorCode: "MISSING_API_BASE_URL",
        message:
          "VITE_API_BASE_URL is not set (Vercel build-time env var). Set it to https://<your-render-domain>/api and redeploy.",
      } as CustomError);
    }

    if (
      import.meta.env.PROD &&
      envBaseURL &&
      resolvedEnvBaseURL !== envBaseURL &&
      (error?.message === "Network Error" || error?.code === "ERR_NETWORK")
    ) {
      return Promise.reject({
        ...error,
        errorCode: "MIXED_CONTENT_BLOCKED",
        message:
          "Your frontend is HTTPS but VITE_API_BASE_URL is HTTP. Use the HTTPS backend URL (e.g. https://<your-domain>/api) and redeploy.",
      } as CustomError);
    }

    if (status === 401 && (data === "Unauthorized" || data?.message === "Unauthorized")) {
      window.location.href = "/";
    }

    const errorCode =
      data?.errorCode ||
      (typeof status === "number" ? `HTTP_${status}` : error?.code || "NETWORK_ERROR");

    return Promise.reject({
      ...error,
      errorCode,
    } as CustomError);
  }
);

export default API;
