const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export type ApiError = { status: number; message: string; details?: any };

function getToken() {
  return localStorage.getItem("medflow_token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const auth = options.auth !== false;
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  const json = text ? safeJson(text) : null;

  if (!res.ok) {
    const message = (json && (json.error || json.message)) || res.statusText || "Request failed";
    const err: ApiError = { status: res.status, message, details: json?.details };
    throw err;
  }

  return (json as T) ?? ({} as T);
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

