'use strict';

/**
 * Positive reviews (rating >= 4) bump the recipient's trust_score_yes
 * counter, which feeds directly into the proximity/trust bid ranking
 * algorithm in api::job.job's rankBids action.
 */

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    if (!result.rating || result.rating < 4) return;

    const toUserId = result.to_user && (result.to_user.id || result.to_user);
    if (!toUserId) return;

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', toUserId);
    if (!user) return;

    await strapi.entityService.update('plugin::users-permissions.user', toUserId, {
      data: { trust_score_yes: (user.trust_score_yes || 0) + 1 },
    });
  },
};
