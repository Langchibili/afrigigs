'use strict';

/**
 * Runs hourly. Any job past its completion_confirmation_deadline that is
 * still `in_progress` with escrow `held` gets auto-flagged to `disputed`
 * so it surfaces in the admin review queue instead of staying silently
 * locked, per the blueprint's escrow safeguard.
 */

module.exports = {
  '0 * * * *': async ({ strapi }) => {
    const now = new Date().toISOString();

    const staleJobs = await strapi.entityService.findMany('api::job.job', {
      filters: {
        status: 'in_progress',
        escrow_status: 'held',
        completion_confirmation_deadline: { $lt: now },
      },
    });

    for (const job of staleJobs) {
      await strapi.entityService.update('api::job.job', job.id, {
        data: { status: 'disputed' },
      });
      strapi.log.info(`Job ${job.id} auto-flagged as disputed (confirmation deadline passed).`);
    }
  },
};
