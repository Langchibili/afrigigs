// // src/api/job/controllers/job.ts

// import { factories } from '@strapi/strapi';

// export default factories.createCoreController('api::job.job', ({ strapi }) => ({
//     /**
//      * Returns a job's bids sorted by:
//      *   1. Proximity to target_city (skipped when scope === 'FOR_EVERYONE')
//      *   2. trust_score_yes (descending)
//      *   3. profile_completion_skilled (descending)
//      */
//     async rankBids(ctx) {
//         try {
//             const { id } = ctx.params;

//             const job: any = await strapi.db.query('api::job.job').findOne({
//                 where: { id },
//                 populate: { bids: { populate: ['user'] } },
//             });

//             if (!job) return ctx.notFound('Job not found');

//             const isGlobal = job.scope === 'FOR_EVERYONE';

//             const ranked = [...(job.bids || [])].sort((a: any, b: any) => {
//                 if (!isGlobal) {
//                     const proximityA = a.user?.native_last_city === job.target_city ? 0 : 1;
//                     const proximityB = b.user?.native_last_city === job.target_city ? 0 : 1;
//                     if (proximityA !== proximityB) return proximityA - proximityB;
//                 }

//                 const trustA = a.user?.trust_score_yes || 0;
//                 const trustB = b.user?.trust_score_yes || 0;
//                 if (trustB !== trustA) return trustB - trustA;

//                 const completionA = a.user?.profile_completion_skilled || 0;
//                 const completionB = b.user?.profile_completion_skilled || 0;
//                 return completionB - completionA;
//             });

//             ctx.send({ success: true, data: ranked });
//         } catch (error) {
//             strapi.log.error('Error ranking bids:', error);
//             ctx.internalServerError('Failed to rank bids');
//         }
//     },
// }));
// src/api/job/controllers/job.ts

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::job.job', ({ strapi }) => ({
    /**
     * Returns a job's bids sorted by:
     *   1. Proximity to target_city (skipped when scope === 'FOR_EVERYONE')
     *   2. trust_score_yes (descending)
     *   3. profile_completion_skilled (descending)
     *
     * The frontend links/fetches jobs by documentId (Strapi v5's document
     * identifier), not the numeric autoincrement id — e.g.
     * GET /api/jobs/:documentId/rank-bids. documentId is a real, indexed
     * column on the underlying table, so `strapi.db.query` (the
     * low-level Query Engine) can filter on it directly, same as any
     * other field — no need to switch to the Document Service API.
     */
    async rankBids(ctx) {
        try {
            const { id } = ctx.params; // this is actually the job's documentId

            const job: any = await strapi.db.query('api::job.job').findOne({
                where: { documentId: id },
                populate: { bids: { populate: ['user'] } },
            });

            if (!job) return ctx.notFound('Job not found');

            const isGlobal = job.scope === 'FOR_EVERYONE';

            const ranked = [...(job.bids || [])].sort((a: any, b: any) => {
                if (!isGlobal) {
                    const proximityA = a.user?.native_last_city === job.target_city ? 0 : 1;
                    const proximityB = b.user?.native_last_city === job.target_city ? 0 : 1;
                    if (proximityA !== proximityB) return proximityA - proximityB;
                }

                const trustA = a.user?.trust_score_yes || 0;
                const trustB = b.user?.trust_score_yes || 0;
                if (trustB !== trustA) return trustB - trustA;

                const completionA = a.user?.profile_completion_skilled || 0;
                const completionB = b.user?.profile_completion_skilled || 0;
                return completionB - completionA;
            });

            ctx.send({ success: true, data: ranked });
        } catch (error: any) {
            strapi.log.error('Error ranking bids:', error);
            ctx.internalServerError('Failed to rank bids');
        }
    },
}));