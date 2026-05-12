const envBaseURLRaw = (import.meta.env.VITE_API_BASE_URL || "").trim();

const normalizeApiBaseUrl = (value: string): string => {
	const trimmed = value.trim().replace(/\/+$/, "");
	if (!trimmed) return "";

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

export const baseURL = envBaseURL
	? envBaseURL
	: import.meta.env.DEV
		? "/api"
		: "";
