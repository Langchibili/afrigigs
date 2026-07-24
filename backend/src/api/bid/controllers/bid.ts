// src/api/bid/controllers/bid.ts

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::bid.bid', ({ strapi }) => ({
    /**
     * Overrides the default create action.
     *
     * Why: Strapi's Content API sanitizer refuses to write a relation
     * that targets plugin::users-permissions.user through the standard
     * create/update flow (POST /api/bids with data.user set throws
     * "Invalid key user"), the same restriction we hit on the read side
     * with GET filters. strapi.db.query (the low-level Query Engine)
     * isn't subject to that restriction, so we create the bid there
     * instead — this still fires the Bid.beforeCreate/beforeUpdate
     * lifecycle hooks (lifecycle hooks run at the DB layer regardless of
     * which API called it), so the existing floor/self-bid/closed-job
     * validation keeps working unchanged.
     *
     * This also means `user` is never taken from the request body — it's
     * always ctx.state.user.id, the authenticated session. Even once the
     * "Invalid key" restriction is worked around, a client should never
     * be able to submit a bid as someone else.
     *
     * POST /api/bids still routes here automatically — overriding a core
     * controller's create action is picked up by createCoreRouter without
     * any change to routes/bid.ts.
     */
    async create(ctx) {
        try {
            const requester = ctx.state.user;
            if (!requester) return ctx.unauthorized('You must be logged in to place a bid.');

            const body = ctx.request.body?.data || {};
            const { job: jobDocumentId, message, proposed_amount_local, proposed_amount_usd } = body;

            if (!jobDocumentId) return ctx.badRequest('A job is required.');

            // The frontend now passes the job's documentId, not its
            // numeric id — resolve it to the row id the Query Engine
            // (and the Bid.beforeCreate lifecycle) actually needs.
            const job: any = await strapi.db.query('api::job.job').findOne({
                where: { documentId: jobDocumentId },
                select: ['id'],
            });
            if (!job) return ctx.notFound('Job not found.');

            const bid = await strapi.db.query('api::bid.bid').create({
                data: {
                    job: job.id,
                    user: requester.id,
                    message,
                    proposed_amount_local,
                    proposed_amount_usd,
                    bid_status: 'pending',
                },
                populate: ['job', 'user'],
            });

            ctx.body = { data: bid };
        } catch (error: any) {
            strapi.log.error('Error creating bid:', error);
            // Lifecycle validation errors (bid floor, self-bid, job not
            // open) throw plain Error(message) — those messages are
            // written to be shown directly in the UI, so surface them
            // as a 400 rather than a generic 500.
            if (error?.message) return ctx.badRequest(error.message);
            ctx.internalServerError('Failed to create bid');
        }
    },
}));