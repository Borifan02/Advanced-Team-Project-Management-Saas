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

// In local dev, default to `/api` so Vite can proxy to the backend.
// In production (Vercel), you MUST set VITE_API_BASE_URL to your backend URL (e.g. https://<render>/api)
// otherwise the frontend will call Vercel itself and you will get 404s.
const baseURL = envBaseURL
  ? envBaseURL.replace(/\/+$/, "")
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
