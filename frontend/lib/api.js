// // /**
// //  * lib/api.js
// //  * Thin fetch wrapper around the Strapi REST API. Handles the JWT from
// //  * local storage, builds Strapi-style bracket query strings (filters[...],
// //  * populate[...], etc.), and throws a normalized ApiError on failure.
// //  */

// // const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// // function toQueryString(params) {
// //   if (!params) return "";
// //   const parts = [];

// //   const walk = (obj, prefix) => {
// //     if (obj === undefined || obj === null) return;
// //     if (Array.isArray(obj)) {
// //       obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
// //     } else if (typeof obj === "object") {
// //       Object.entries(obj).forEach(([k, v]) => walk(v, `${prefix}[${k}]`));
// //     } else {
// //       parts.push(`${prefix}=${encodeURIComponent(String(obj))}`);
// //     }
// //   };

// //   Object.entries(params).forEach(([key, value]) => walk(value, key));
// //   return parts.length ? `?${parts.join("&")}` : "";
// // }

// // function getToken() {
// //   if (typeof window === "undefined") return null;
// //   return window.localStorage.getItem("afrigigs_jwt");
// // }

// // export function setToken(token) {
// //   if (typeof window === "undefined") return;
// //   if (token) window.localStorage.setItem("afrigigs_jwt", token);
// //   else window.localStorage.removeItem("afrigigs_jwt");
// // }

// // export class ApiError extends Error {
// //   constructor(message, status, details) {
// //     super(message);
// //     this.status = status;
// //     this.details = details;
// //   }
// // }

// // async function request(path, options = {}) {
// //   const { query, headers, ...rest } = options;
// //   const token = getToken();

// //   const res = await fetch(`${STRAPI_URL}/api${path}${toQueryString(query)}`, {
// //     ...rest,
// //     headers: {
// //       ...(rest.body && !(rest.body instanceof FormData)
// //         ? { "Content-Type": "application/json" }
// //         : {}),
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       ...headers,
// //     },
// //     cache: "no-store",
// //   });

// //   const isJson = res.headers.get("content-type")?.includes("application/json");
// //   const body = isJson ? await res.json().catch(() => null) : null;

// //   if (!res.ok) {
// //     // Strapi error shape: { error: { message, details } }, or a plain
// //     // string from our custom controllers' ctx.badRequest/forbidden calls.
// //     const message = body?.error?.message || body?.message || `Request failed (${res.status})`;
// //     throw new ApiError(message, res.status, body?.error?.details);
// //   }

// //   return body;
// // }

// // export const api = {
// //   get: (path, query) => request(path, { method: "GET", query }),
// //   post: (path, data, query) =>
// //     request(path, {
// //       method: "POST",
// //       query,
// //       body: data instanceof FormData ? data : JSON.stringify({ data }),
// //     }),
// //   // For endpoints that don't expect Strapi's {data:...} envelope
// //   // (auth, /users/me/location, /escrow-transactions/:id/release, etc.)
// //   postRaw: (path, data, query) =>
// //     request(path, { method: "POST", query, body: JSON.stringify(data ?? {}) }),
// //   put: (path, data, query) => request(path, { method: "PUT", query, body: JSON.stringify({ data }) }),
// //   del: (path, query) => request(path, { method: "DELETE", query }),
// //   upload: (path, form) => request(path, { method: "POST", body: form }),
// // };

// // export { STRAPI_URL };
// /**
//  * lib/endpoints.js
//  * Domain functions layered over lib/api.js.
//  *
//  * IMPORTANT — Strapi's Content API sanitizer refuses to filter ANY
//  * collection through a relation that targets plugin::users-permissions.user
//  * (owner, assigned_worker, user, to_user, participants) — it throws
//  * "Invalid key <field>" no matter how the filter is written (flat FK or
//  * nested [id]). This is enforced unconditionally, not a permissions
//  * setting. So instead of e.g. GET /api/jobs?filters[owner]=1, "my X"
//  * queries below call custom /users/me/* routes (see
//  * extensions/users-permissions/strapi-server.ts) that use the low-level
//  * Query Engine server-side, scoped to the authenticated user. Filters
//  * into ordinary content types (Country, SkillsCatalog, etc.) are
//  * unaffected and still use the normal filters[...] query params.
//  */
// import { api } from "./api";

// /* ---------------------------------- Auth --------------------------------- */

// export const AuthApi = {
//   login: (identifier, password) => api.postRaw("/auth/local", { identifier, password }),
//   register: (username, email, password) =>
//     api.postRaw("/auth/local/register", { username, email, password }),
//   me: () =>
//     api.get("/users/me", {
//       populate: ["country", "skilled_profile", "professional_profile", "wallet"],
//     }),
// };

// /* -------------------------------- Countries ------------------------------- */

// export const CountryApi = {
//   list: () => api.get("/countries", { populate: ["currency"] }),
// };

// /* --------------------------------- Skills --------------------------------- */

// export const SkillsApi = {
//   list: () => api.get("/skills-catalogs"),
// };

// /* ---------------------------------- Jobs ---------------------------------- */

// export const JobApi = {
//   // Public/open browse listing — no user-relation filters here, so the
//   // normal Content API filters are fine.
//   list: (filters = {}) => {
//     const query = {
//       populate: ["budget_currency", "skills_required", "country"],
//       sort: "createdAt:desc",
//       pagination: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 12 },
//       filters: {},
//     };
//     if (filters.status) query.filters.status = filters.status;
//     if (filters.countryId) query.filters.country = filters.countryId;
//     if (filters.scope) query.filters.scope = filters.scope;
//     if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
//     return api.get("/jobs", query);
//   },

//   get: (id) =>
//     api.get(`/jobs/${id}`, {
//       populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
//     }),

//   create: (data) => api.post("/jobs", data),

//   rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),

//   // "role" is "owner" (jobs I posted) or "assigned" (jobs assigned to me).
//   // Uses the custom GET /users/me/jobs route — see file header note.
//   mine: (role = "owner", pageSize = 12) => api.get("/users/me/jobs", { role, pageSize }),
// };

// /* ---------------------------------- Bids ----------------------------------- */

// export const BidApi = {
//   create: (data) => api.post("/bids", data),
//   withdraw: (id) => api.put(`/bids/${id}`, { status: "withdrawn" }),
//   // Uses the custom GET /users/me/bids route — see file header note.
//   mine: () => api.get("/users/me/bids"),
// };

// /* -------------------------------- Profiles --------------------------------- */

// export const ProfileApi = {
//   updateSkilled: (id, data) => api.put(`/skilled-profiles/${id}`, data),
//   createSkilled: (data) => api.post("/skilled-profiles", data),

//   updateProfessional: (id, data) => api.put(`/professional-profiles/${id}`, data),
//   createProfessional: (data) => api.post("/professional-profiles", data),

//   getUserPublic: (id) =>
//     api.get(`/users/${id}`, { populate: ["skilled_profile", "professional_profile", "country"] }),

//   updateMe: (id, data) => api.put(`/users/${id}`, data),

//   updateMyLocation: (latitude, longitude) =>
//     api.postRaw("/users/me/location", { latitude, longitude }),
// };

// /* -------------------------------- Verification ------------------------------ */

// export const VerificationApi = {
//   uploadVideo: (file) => {
//     const form = new FormData();
//     form.append("files", file);
//     return api.upload("/upload", form);
//   },
//   submit: (userId, videoMediaId) =>
//     api.post("/verification-submissions", { user: userId, video: videoMediaId, status: "pending" }),
//   // Verification submissions belong to the caller only, so this can stay
//   // scoped to "me" without touching the blocked filter path — swap for a
//   // custom /users/me/verification route if this starts 400ing too.
//   statusForUser: (userId) =>
//     api.get("/verification-submissions", {
//       filters: { user: userId },
//       sort: "createdAt:desc",
//       pagination: { pageSize: 1 },
//     }),
// };

// /* ----------------------------------- Wallet ---------------------------------- */

// export const WalletApi = {
//   // Uses the custom GET /users/me/wallet route — see file header note.
//   getMine: () => api.get("/users/me/wallet"),
//   // Uses the custom GET /users/me/escrow-transactions route.
//   myTransactions: () => api.get("/users/me/escrow-transactions"),
//   release: (transactionId) => api.postRaw(`/escrow-transactions/${transactionId}/release`),
//   fund: (data) => api.post("/escrow-transactions", data),
// };

// /* --------------------------------- Reviews ----------------------------------- */

// export const ReviewApi = {
//   create: (data) => api.post("/reviews", data),
//   // Uses the custom GET /users/:id/reviews route — see file header note.
//   listForUser: (toUserId) => api.get(`/users/${toUserId}/reviews`),
// };

// /* ------------------------------- Conversations -------------------------------- */

// export const MessagingApi = {
//   // Uses the custom GET /users/me/conversations route — see file header note.
//   mine: () => api.get("/users/me/conversations"),
//   getConversation: (id) =>
//     api.get(`/conversations/${id}`, {
//       populate: ["job", "participants", { messages: { populate: ["sender"] } }],
//     }),
//   sendMessage: (data) => api.post("/messages", data),
// };
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