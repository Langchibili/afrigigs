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
//     if (filters.job_status) query.filters.job_status = filters.job_status;
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
//   withdraw: (id) => api.put(`/bids/${id}`, { bid_status: "withdrawn" }),
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
//     api.post("/verification-submissions", { user: userId, video: videoMediaId, verification_status: "pending" }),
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
 * lib/endpoints.js
 * Domain functions layered over lib/api.js.
 *
 * IMPORTANT — Strapi's Content API sanitizer refuses to filter ANY
 * collection through a relation that targets plugin::users-permissions.user
 * (owner, assigned_worker, user, to_user, participants) — it throws
 * "Invalid key <field>" no matter how the filter is written (flat FK or
 * nested [id]). This is enforced unconditionally, not a permissions
 * setting. So instead of e.g. GET /api/jobs?filters[owner]=1, "my X"
 * queries below call custom /users/me/* routes (see
 * extensions/users-permissions/strapi-server.ts) that use the low-level
 * Query Engine server-side, scoped to the authenticated user. Filters
 * into ordinary content types (Country, SkillsCatalog, etc.) are
 * unaffected and still use the normal filters[...] query params.
 */
import { api } from "./api";

/* ---------------------------------- Auth --------------------------------- */

export const AuthApi = {
  login: (identifier, password) => api.postRaw("/auth/local", { identifier, password }),
  register: (username, email, password) =>
    api.postRaw("/auth/local/register", { username, email, password }),
  me: () =>
    api.get("/users/me", {
      populate: ["country", "skilled_profile", "professional_profile", "wallet"],
    }),
};

/* -------------------------------- Countries ------------------------------- */

export const CountryApi = {
  list: () => api.get("/countries", { populate: ["currency"] }),
};

/* --------------------------------- Skills --------------------------------- */

export const SkillsApi = {
  list: () => api.get("/skills-catalogs"),
};

/* ---------------------------------- Jobs ---------------------------------- */

export const JobApi = {
  // Public/open browse listing — no user-relation filters here, so the
  // normal Content API filters are fine.
  list: (filters = {}) => {
    const query = {
      populate: ["budget_currency", "skills_required", "country"],
      sort: "createdAt:desc",
      pagination: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 12 },
      filters: {},
    };
    if (filters.jobStatus) query.filters.job_status = filters.jobStatus;
    if (filters.countryId) query.filters.country = filters.countryId;
    if (filters.scope) query.filters.scope = filters.scope;
    if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
    return api.get("/jobs", query);
  },

  get: (id) =>
    api.get(`/jobs/${id}`, {
      populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
    }),

  // draftAndPublish is enabled on Job — without ?status=published, a new
  // job saves as a draft and won't show up via GET /jobs/:id or any
  // filtered list until someone publishes it in the admin panel.
  create: (data) => api.post("/jobs", data, { job_status: "published" }),

  rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),

  // "role" is "owner" (jobs I posted) or "assigned" (jobs assigned to me).
  // Uses the custom GET /users/me/jobs route — see file header note.
  mine: (role = "owner", pageSize = 12) => api.get("/users/me/jobs", { role, pageSize }),
};

/* ---------------------------------- Bids ----------------------------------- */

export const BidApi = {
  create: (data) => api.post("/bids", data),
  withdraw: (id) => api.put(`/bids/${id}`, { bid_status: "withdrawn" }),
  // Uses the custom GET /users/me/bids route — see file header note.
  mine: () => api.get("/users/me/bids"),
};

/* -------------------------------- Profiles --------------------------------- */

export const ProfileApi = {
  updateSkilled: (id, data) => api.put(`/skilled-profiles/${id}`, data),
  createSkilled: (data) => api.post("/skilled-profiles", data),

  updateProfessional: (id, data) => api.put(`/professional-profiles/${id}`, data),
  createProfessional: (data) => api.post("/professional-profiles", data),

  getUserPublic: (id) =>
    api.get(`/users/${id}`, { populate: ["skilled_profile", "professional_profile", "country"] }),

  updateMe: (id, data) => api.put(`/users/${id}`, data),

  updateMyLocation: (latitude, longitude) =>
    api.postRaw("/users/me/location", { latitude, longitude }),
};

/* -------------------------------- Verification ------------------------------ */

export const VerificationApi = {
  uploadVideo: (file) => {
    const form = new FormData();
    form.append("files", file);
    return api.upload("/upload", form);
  },
  submit: (userId, videoMediaId) =>
    api.post("/verification-submissions", { user: userId, video: videoMediaId, verification_status: "pending" }),
  // Verification submissions belong to the caller only, so this can stay
  // scoped to "me" without touching the blocked filter path — swap for a
  // custom /users/me/verification route if this starts 400ing too.
  statusForUser: (userId) =>
    api.get("/verification-submissions", {
      filters: { user: userId },
      sort: "createdAt:desc",
      pagination: { pageSize: 1 },
    }),
};

/* ----------------------------------- Wallet ---------------------------------- */

export const WalletApi = {
  // Uses the custom GET /users/me/wallet route — see file header note.
  getMine: () => api.get("/users/me/wallet"),
  // Uses the custom GET /users/me/escrow-transactions route.
  myTransactions: () => api.get("/users/me/escrow-transactions"),
  release: (transactionId) => api.postRaw(`/escrow-transactions/${transactionId}/release`),
  fund: (data) => api.post("/escrow-transactions", data),
};

/* --------------------------------- Reviews ----------------------------------- */

export const ReviewApi = {
  create: (data) => api.post("/reviews", data),
  // Uses the custom GET /users/:id/reviews route — see file header note.
  listForUser: (toUserId) => api.get(`/users/${toUserId}/reviews`),
};

/* ------------------------------- Conversations -------------------------------- */

export const MessagingApi = {
  // Uses the custom GET /users/me/conversations route — see file header note.
  mine: () => api.get("/users/me/conversations"),
  getConversation: (id) =>
    api.get(`/conversations/${id}`, {
      populate: ["job", "participants", { messages: { populate: ["sender"] } }],
    }),
  sendMessage: (data) => api.post("/messages", data),
};