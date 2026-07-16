/**
 * lib/api.js
 * Thin fetch wrapper around the Strapi REST API. Handles the JWT from
 * local storage, builds Strapi-style bracket query strings (filters[...],
 * populate[...], etc.), and throws a normalized ApiError on failure.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

function toQueryString(params) {
  if (!params) return "";
  const parts = [];

  const walk = (obj, prefix) => {
    if (obj === undefined || obj === null) return;
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
    } else if (typeof obj === "object") {
      Object.entries(obj).forEach(([k, v]) => walk(v, `${prefix}[${k}]`));
    } else {
      parts.push(`${prefix}=${encodeURIComponent(String(obj))}`);
    }
  };

  Object.entries(params).forEach(([key, value]) => walk(value, key));
  return parts.length ? `?${parts.join("&")}` : "";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("afrigigs_jwt");
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("afrigigs_jwt", token);
  else window.localStorage.removeItem("afrigigs_jwt");
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const { query, headers, ...rest } = options;
  const token = getToken();

  const res = await fetch(`${STRAPI_URL}/api${path}${toQueryString(query)}`, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // Strapi error shape: { error: { message, details } }, or a plain
    // string from our custom controllers' ctx.badRequest/forbidden calls.
    const message = body?.error?.message || body?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body?.error?.details);
  }

  return body;
}

export const api = {
  get: (path, query) => request(path, { method: "GET", query }),
  post: (path, data, query) =>
    request(path, {
      method: "POST",
      query,
      body: data instanceof FormData ? data : JSON.stringify({ data }),
    }),
  // For endpoints that don't expect Strapi's {data:...} envelope
  // (auth, /users/me/location, /escrow-transactions/:id/release, etc.)
  postRaw: (path, data, query) =>
    request(path, { method: "POST", query, body: JSON.stringify(data ?? {}) }),
  put: (path, data, query) => request(path, { method: "PUT", query, body: JSON.stringify({ data }) }),
  del: (path, query) => request(path, { method: "DELETE", query }),
  upload: (path, form) => request(path, { method: "POST", body: form }),
};

export { STRAPI_URL };
