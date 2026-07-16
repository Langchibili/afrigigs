/**
 * lib/endpoints.js
 * Domain functions layered over lib/api.js. Pages/components should call
 * these instead of hitting `api` directly, so the exact populate/filter
 * shape for each Strapi content type lives in one place.
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
  list: (filters = {}) => {
    const query = {
      populate: ["budget_currency", "skills_required", "country"],
      sort: "createdAt:desc",
      pagination: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 12 },
      filters: {},
    };
    if (filters.status) query.filters.status = filters.status;
    if (filters.countryId) query.filters.country = { id: filters.countryId };
    if (filters.scope) query.filters.scope = filters.scope;
    if (filters.ownerId) query.filters.owner = { id: filters.ownerId };
    if (filters.assignedWorkerId) query.filters.assigned_worker = { id: filters.assignedWorkerId };
    if (filters.skillIds?.length) query.filters.skills_required = { id: { $in: filters.skillIds } };
    return api.get("/jobs", query);
  },

  get: (id) =>
    api.get(`/jobs/${id}`, {
      populate: ["owner", "country", "budget_currency", "skills_required", "assigned_worker"],
    }),

  create: (data) => api.post("/jobs", data),

  rankBids: (id) => api.get(`/jobs/${id}/rank-bids`),
};

/* ---------------------------------- Bids ----------------------------------- */

export const BidApi = {
  create: (data) => api.post("/bids", data),
  withdraw: (id) => api.put(`/bids/${id}`, { status: "withdrawn" }),
  listForUser: (userId) =>
    api.get("/bids", {
      filters: { user: { id: userId } },
      populate: ["job"],
      sort: "createdAt:desc",
    }),
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
  statusForUser: (userId) =>
    api.get("/verification-submissions", {
      filters: { user: { id: userId } },
      sort: "createdAt:desc",
      pagination: { pageSize: 1 },
    }),
};

/* ----------------------------------- Wallet ---------------------------------- */

export const WalletApi = {
  getForUser: (userId) =>
    api.get("/wallets", { filters: { user: { id: userId } }, populate: ["currency"] }),
  transactionsForOwner: (ownerId) =>
    api.get("/escrow-transactions", {
      filters: { job: { owner: { id: ownerId } } },
      populate: ["job", "currency"],
      sort: "createdAt:desc",
    }),
  release: (transactionId) => api.postRaw(`/escrow-transactions/${transactionId}/release`),
  fund: (data) => api.post("/escrow-transactions", data),
};

/* --------------------------------- Reviews ----------------------------------- */

export const ReviewApi = {
  create: (data) => api.post("/reviews", data),
  listForUser: (toUserId) =>
    api.get("/reviews", {
      filters: { to_user: { id: toUserId } },
      populate: ["from_user"],
      sort: "createdAt:desc",
    }),
};

/* ------------------------------- Conversations -------------------------------- */

export const MessagingApi = {
  listConversations: (userId) =>
    api.get("/conversations", {
      filters: { participants: { id: userId } },
      populate: ["job", "participants", "messages"],
    }),
  getConversation: (id) =>
    api.get(`/conversations/${id}`, {
      populate: ["job", "participants", { messages: { populate: ["sender"] } }],
    }),
  sendMessage: (data) => api.post("/messages", data),
};
