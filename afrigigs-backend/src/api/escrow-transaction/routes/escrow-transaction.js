'use strict';

/**
 * escrow-transaction router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::escrow-transaction.escrow-transaction');

const customRoutes = [
  {
    method: 'POST',
    path: '/escrow-transactions/:id/release',
    handler: 'escrow-transaction.release',
    config: {
      policies: [],
    },
  },
];

module.exports = {
  routes: [...customRoutes, ...defaultRouter.routes],
};
