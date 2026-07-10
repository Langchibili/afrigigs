'use strict';

/**
 * When an admin/reviewer flips a submission to "approved", automatically
 * mark the related user as verified and stamp the review time. Rejections
 * simply leave the user unverified.
 */

module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    const newStatus = params.data && params.data.status;

    if (newStatus !== 'approved') return;

    const submission = await strapi.entityService.findOne(
      'api::verification-submission.verification-submission',
      result.id,
      { populate: ['user'] }
    );

    if (!submission || !submission.user) return;

    await strapi.entityService.update('plugin::users-permissions.user', submission.user.id, {
      data: { is_verified_human: true },
    });

    await strapi.entityService.update(
      'api::verification-submission.verification-submission',
      result.id,
      { data: { reviewed_at: new Date() } }
    );
  },
};
