'use strict';

module.exports = {
  register(/* { strapi } */) {},

  /**
   * Bootstrap: on first boot, grant the `public` role read access to
   * reference/localization data (countries, currencies, skills) so the
   * Next.js app can populate dropdowns before a user logs in, while
   * everything transactional (jobs, bids, wallets, escrow) stays behind
   * the `authenticated` role by default (configure per-action in the
   * admin panel's Roles UI, this just sets a safe baseline).
   */
  async bootstrap({ strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const publicReadable = [
      'api::currency.currency',
      'api::country.country',
      'api::skills-catalog.skills-catalog',
    ];

    const actions = ['find', 'findOne'];

    for (const uid of publicReadable) {
      for (const action of actions) {
        const permissionUid = `${uid}.${action}`;
        await strapi.query('plugin::users-permissions.permission').updateMany({
          where: { role: publicRole.id, action: permissionUid },
          data: { enabled: true },
        });
      }
    }

    strapi.log.info('AfriGigs bootstrap: public read permissions verified for reference data.');
  },
};
