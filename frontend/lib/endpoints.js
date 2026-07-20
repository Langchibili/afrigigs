// // /**
// //  * lib/endpoints.js
// //  * Domain functions layered over lib/api.js. Pages/components should call
// //  * these instead of hitting `api` directly, so the exact populate/filter
// //  * shape for each Strapi content type lives in one place.
// //  */
// // import { api } from "./api";

// // /* ---------------------------------- Auth --------------------------------- */

// // export const AuthApi = {
// //   login: (identifier, password) => api.postRaw("/auth/local", { identifier, password }),
// //   register: (username, email, password) =>
// //     api.postRaw("/auth/local/register", { username, email, password }),
// //   me: () =>
// //     api.get("/users/me", {
// //       populate: ["country", "skilled_profile", "professional_profile", "wallet"],
// //     }),
// // };

// // /* -------------------------------- Countries ------------------------------- */

// // export const CountryApi = {
// //   list: () => api.get("/countries", { populate: ["currency"] }),
// // };

// // /* --------------------------------- Skills --------------------------------- */

// // export const SkillsApi = {
// //   list: () => api.get("/skills-catalogs"),
// // };

// // /* ---------------------------------- Jobs ---------------------------------- */

// // export const JobApi = {
// //   list: (filters = {}) => {
// //     const query = {
// //       populate: ["budget_currency", "skills_required", "country"],
// //       sort: "createdAt:desc",
// //       pagination: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 12 },
// //       filters: {},
// //     };
// //     if (filters.status) query.filters.status = filters.status;
// //     if (filters.countryId) query.filters.country = { id: filters.countryId };
// //     if (filters.scope) query.filters.scope = filters.scope;
// //     if (filters.ownerId) query.filters.owner = { id: filters.ownerId };
// //     if (filters.assignedWorkerId) query.filters.assigned_worker = { id: filters.assignedWorkerId };
// //     if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
// //     return api.get("/jobs", query);
// //   },

// //   get: (id) =>
// //     api.get(`/jobs/${id}`, {
// //       populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
// //     }),

// //   create: (data) => api.post("/jobs", data),

// //   rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),
// // };

// // /* ---------------------------------- Bids ----------------------------------- */

// // export const BidApi = {
// //   create: (data) => api.post("/bids", data),
// //   withdraw: (id) => api.put(`/bids/${id}`, { status: "withdrawn" }),
// //   listForUser: (userId) =>
// //     api.get("/bids", {
// //       filters: { user: { id: userId } },
// //       populate: ["job"],
// //       sort: "createdAt:desc",
// //     }),
// // };

// // /* -------------------------------- Profiles --------------------------------- */

// // export const ProfileApi = {
// //   updateSkilled: (id, data) => api.put(`/skilled-profiles/${id}`, data),
// //   createSkilled: (data) => api.post("/skilled-profiles", data),

// //   updateProfessional: (id, data) => api.put(`/professional-profiles/${id}`, data),
// //   createProfessional: (data) => api.post("/professional-profiles", data),

// //   getUserPublic: (id) =>
// //     api.get(`/users/${id}`, { populate: ["skilled_profile", "professional_profile", "country"] }),

// //   updateMe: (id, data) => api.put(`/users/${id}`, data),

// //   updateMyLocation: (latitude, longitude) =>
// //     api.postRaw("/users/me/location", { latitude, longitude }),
// // };

// // /* -------------------------------- Verification ------------------------------ */

// // export const VerificationApi = {
// //   uploadVideo: (file) => {
// //     const form = new FormData();
// //     form.append("files", file);
// //     return api.upload("/upload", form);
// //   },
// //   submit: (userId, videoMediaId) =>
// //     api.post("/verification-submissions", { user: userId, video: videoMediaId, status: "pending" }),
// //   statusForUser: (userId) =>
// //     api.get("/verification-submissions", {
// //       filters: { user: { id: userId } },
// //       sort: "createdAt:desc",
// //       pagination: { pageSize: 1 },
// //     }),
// // };

// // /* ----------------------------------- Wallet ---------------------------------- */

// // export const WalletApi = {
// //   getForUser: (userId) =>
// //     api.get("/wallets", { filters: { user: { id: userId } }, populate: ["currency"] }),
// //   transactionsForOwner: (ownerId) =>
// //     api.get("/escrow-transactions", {
// //       filters: { job: { owner: { id: ownerId } } },
// //       populate: ["job", "currency"],
// //       sort: "createdAt:desc",
// //     }),
// //   release: (transactionId) => api.postRaw(`/escrow-transactions/${transactionId}/release`),
// //   fund: (data) => api.post("/escrow-transactions", data),
// // };

// // /* --------------------------------- Reviews ----------------------------------- */

// // export const ReviewApi = {
// //   create: (data) => api.post("/reviews", data),
// //   listForUser: (toUserId) =>
// //     api.get("/reviews", {
// //       filters: { to_user: { id: toUserId } },
// //       populate: ["from_user"],
// //       sort: "createdAt:desc",
// //     }),
// // };

// // /* ------------------------------- Conversations -------------------------------- */

// // export const MessagingApi = {
// //   listConversations: (userId) =>
// //     api.get("/conversations", {
// //       filters: { participants: { id: userId } },
// //       populate: ["job", "participants", "messages"],
// //     }),
// //   getConversation: (id) =>
// //     api.get(`/conversations/${id}`, {
// //       populate: ["job", "participants", { messages: { populate: ["sender"] } }],
// //     }),
// //   sendMessage: (data) => api.post("/messages", data),
// // };

// /**
//  * lib/endpoints.js
//  * Domain functions layered over lib/api.js. Pages/components should call
//  * these instead of hitting `api` directly, so the exact populate/filter
//  * shape for each Strapi content type lives in one place.
//  *
//  * IMPORTANT — relation filtering: Strapi's query sanitizer blocks deep
//  * filtering INTO the plugin::users-permissions.user schema (e.g.
//  * `filters[owner][id]=1` throws "Invalid key owner" because it tries to
//  * traverse into the User content type's `id` field, which is sanitized
//  * away). The fix is to filter by the relation's foreign key directly —
//  * `filters[owner]=1` — which compares the FK column without visiting the
//  * related schema at all. Every filter below that points at a user
//  * relation (owner, assigned_worker, user, to_user, participants, and the
//  * nested job.owner) uses this direct-ID form. Filters into ordinary
//  * content types (Country, SkillsCatalog, etc.) aren't restricted this
//  * way and can still use the nested `{ id: ... }` / operator form.
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
//   list: (filters = {}) => {
//     const query = {
//       populate: ["budget_currency", "skills_required", "country"],
//       sort: "createdAt:desc",
//       pagination: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 12 },
//       filters: {},
//     };
//     if (filters.status) query.filters.status = filters.status;
//     // Country is an ordinary content type — nested/id filtering is fine.
//     if (filters.countryId) query.filters.country = filters.countryId;
//     if (filters.scope) query.filters.scope = filters.scope;
//     // owner / assigned_worker point at plugin::users-permissions.user —
//     // filter by the FK directly, not filters[owner][id].
//     if (filters.ownerId) query.filters.owner = filters.ownerId;
//     if (filters.assignedWorkerId) query.filters.assigned_worker = filters.assignedWorkerId;
//     if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
//     return api.get("/jobs", query);
//   },

//   get: (id) =>
//     api.get(`/jobs/${id}`, {
//       populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
//     }),

//   create: (data) => api.post("/jobs", data),

//   rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),
// };

// /* ---------------------------------- Bids ----------------------------------- */

// export const BidApi = {
//   create: (data) => api.post("/bids", data),
//   withdraw: (id) => api.put(`/bids/${id}`, { status: "withdrawn" }),
//   listForUser: (userId) =>
//     api.get("/bids", {
//       filters: { user: userId }, // direct FK — see file header note
//       populate: ["job"],
//       sort: "createdAt:desc",
//     }),
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
//   statusForUser: (userId) =>
//     api.get("/verification-submissions", {
//       filters: { user: userId }, // direct FK — see file header note
//       sort: "createdAt:desc",
//       pagination: { pageSize: 1 },
//     }),
// };

// /* ----------------------------------- Wallet ---------------------------------- */

// export const WalletApi = {
//   getForUser: (userId) =>
//     api.get("/wallets", {
//       filters: { user: userId }, // direct FK — see file header note
//       populate: ["currency"],
//     }),
//   transactionsForOwner: (ownerId) =>
//     api.get("/escrow-transactions", {
//       // job.owner is also a user relation — keep it as a direct FK one
//       // level under job (filters[job][owner]=1), not filters[job][owner][id].
//       filters: { job: { owner: ownerId } },
//       populate: ["job", "currency"],
//       sort: "createdAt:desc",
//     }),
//   release: (transactionId) => api.postRaw(`/escrow-transactions/${transactionId}/release`),
//   fund: (data) => api.post("/escrow-transactions", data),
// };

// /* --------------------------------- Reviews ----------------------------------- */

// export const ReviewApi = {
//   create: (data) => api.post("/reviews", data),
//   listForUser: (toUserId) =>
//     api.get("/reviews", {
//       filters: { to_user: toUserId }, // direct FK — see file header note
//       populate: ["from_user"],
//       sort: "createdAt:desc",
//     }),
// };

// /* ------------------------------- Conversations -------------------------------- */

// export const MessagingApi = {
//   listConversations: (userId) =>
//     api.get("/conversations", {
//       filters: { participants: userId }, // direct FK — see file header note
//       populate: ["job", "participants", "messages"],
//     }),
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
    if (filters.status) query.filters.status = filters.status;
    if (filters.countryId) query.filters.country = filters.countryId;
    if (filters.scope) query.filters.scope = filters.scope;
    if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
    return api.get("/jobs", query);
  },

  get: (id) =>
    api.get(`/jobs/${id}`, {
      populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
    }),

  create: (data) => api.post("/jobs", data),

  rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),

  // "role" is "owner" (jobs I posted) or "assigned" (jobs assigned to me).
  // Uses the custom GET /users/me/jobs route — see file header note.
  mine: (role = "owner", pageSize = 12) => api.get("/users/me/jobs", { role, pageSize }),
};

/* ---------------------------------- Bids ----------------------------------- */

export const BidApi = {
  create: (data) => api.post("/bids", data),
  withdraw: (id) => api.put(`/bids/${id}`, { status: "withdrawn" }),
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
    api.post("/verification-submissions", { user: userId, video: videoMediaId, status: "pending" }),
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