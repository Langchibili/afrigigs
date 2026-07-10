'use strict';

/**
 * escrow-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::escrow-transaction.escrow-transaction');
