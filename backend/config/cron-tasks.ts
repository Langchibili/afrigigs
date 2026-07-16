// config/cron-tasks.ts

export default {
    /**
     * Hourly: any in_progress job with held escrow past its
     * completion_confirmation_deadline auto-flags to disputed so it surfaces
     * for admin review instead of sitting silently locked.
     */
    '0 * * * *': async ({ strapi }: { strapi: any }) => {
        const now = new Date().toISOString();

        const staleJobs: any[] = await strapi.db.query('api::job.job').findMany({
            where: {
                status: 'in_progress',
                escrow_status: 'held',
                completion_confirmation_deadline: { $lt: now },
            },
        });

        for (const job of staleJobs) {
            await strapi.db.query('api::job.job').update({
                where: { id: job.id },
                data: { status: 'disputed' },
            });
            strapi.log.info(`Job ${job.id} auto-flagged as disputed (confirmation deadline passed).`);
        }
    },
};