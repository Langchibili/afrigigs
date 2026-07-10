'use strict';

/**
 * skills-catalog service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::skills-catalog.skills-catalog');
