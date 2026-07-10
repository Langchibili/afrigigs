'use strict';

/**
 * job controller
 *
 * Extends the generated core controller with a custom `rankBids` action
 * that returns a job's bids sorted by:
 *   1. Proximity to the job's target_city (only when scope is not FOR_EVERYONE)
 *   2. trust_score_yes (descending)
 *   3. profile_completion_skilled (descending)
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::job.job', ({ strapi }) => ({
  async rankBids(ctx) {
    const { id } = ctx.params;

    const job = await strapi.entityService.findOne('api::job.job', id, {
      populate: {
        bids: {
          populate: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      return ctx.notFound('Job not found');
    }

    const isGlobal = job.scope === 'FOR_EVERYONE';

    const ranked = [...(job.bids || [])].sort((a, b) => {
      if (!isGlobal) {
        const proximityA = a.user && a.user.native_last_city === job.target_city ? 0 : 1;
        const proximityB = b.user && b.user.native_last_city === job.target_city ? 0 : 1;
        if (proximityA !== proximityB) return proximityA - proximityB;
      }

      const trustA = (a.user && a.user.trust_score_yes) || 0;
      const trustB = (b.user && b.user.trust_score_yes) || 0;
      if (trustB !== trustA) return trustB - trustA;

      const completionA = (a.user && a.user.profile_completion_skilled) || 0;
      const completionB = (b.user && b.user.profile_completion_skilled) || 0;
      return completionB - completionA;
    });

    ctx.body = { data: ranked };
  },
}));
