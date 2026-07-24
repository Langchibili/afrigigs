// // config/cron-tasks.ts

// export default {
//     /**
//      * Hourly: any in_progress job with held escrow past its
//      * completion_confirmation_deadline auto-flags to disputed so it surfaces
//      * for admin review instead of sitting silently locked.
//      */
//     '0 * * * *': async ({ strapi }: { strapi: any }) => {
//         const now = new Date().toISOString();

//         const staleJobs: any[] = await strapi.db.query('api::job.job').findMany({
//             where: {
//                 status: 'in_progress',
//                 escrow_status: 'held',
//                 completion_confirmation_deadline: { $lt: now },
//             },
//         });

//         for (const job of staleJobs) {
//             await strapi.db.query('api::job.job').update({
//                 where: { id: job.id },
//                 data: { status: 'disputed' },
//             });
//             strapi.log.info(`Job ${job.id} auto-flagged as disputed (confirmation deadline passed).`);
//         }
//     },
// };
// config/cron-tasks.ts

import { getSettings } from '../src/services/settingsService';

export default {
    '0 * * * *': async ({ strapi }: { strapi: any }) => {
        const settings = await getSettings();
        const now = new Date();
        const fallbackCutoff = new Date(now.getTime() - settings.escrow_auto_dispute_hours * 60 * 60 * 1000);

        const staleJobs: any[] = await strapi.db.query('api::job.job').findMany({
            where: {
                job_status: 'in_progress',
                escrow_status: 'held',
                $or: [
                    { completion_confirmation_deadline: { $lt: now.toISOString() } },
                    {
                        completion_confirmation_deadline: { $null: true },
                        updatedAt: { $lt: fallbackCutoff.toISOString() },
                    },
                ],
            },
        });

        for (const job of staleJobs) {
            await strapi.db.query('api::job.job').update({
                where: { id: job.id },
                data: { job_status: 'disputed' },
            });
            strapi.log.info(`Job ${job.id} auto-flagged as disputed (confirmation deadline passed).`);
        }
    },
};