'use strict';

/**
 * job router
 *
 * Combines the default CRUD routes with a custom route for proximity-based
 * bid ranking.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::job.job');

const customRoutes = [
  {
    method: 'GET',
    path: '/jobs/:id/rank-bids',
    handler: 'job.rankBids',
    config: {
      policies: [],
    },
  },
];

module.exports = {
  routes: [...customRoutes, ...defaultRouter.routes],
};
