// // import type { Core } from '@strapi/strapi';

// export default {
//   /**
//    * An asynchronous register function that runs before
//    * your application is initialized.
//    *
//    * This gives you an opportunity to extend code.
//    */
//   register(/* { strapi }: { strapi: Core.Strapi } */) {},

//   /**
//    * An asynchronous bootstrap function that runs before
//    * your application gets started.
//    *
//    * This gives you an opportunity to set up your data model,
//    * run jobs, or perform some special logic.
//    */
//   bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
// };
// src/index.ts

import { getSettings } from './services/settingsService';

export default {
  register({ strapi }: { strapi: any }) {
    strapi.server.use(async (ctx: any, next: any) => {
      if (
        ctx.request.url.startsWith('/admin') ||
        ctx.request.url.startsWith('/content-manager') ||
        ctx.request.url.startsWith('/api/admn-settings') ||
        ctx.request.url.startsWith('/api/auth')
      ) {
        return next();
      }

      const settings = await getSettings();
      if (settings.maintenance_mode) {
        ctx.status = 503;
        ctx.body = {
          error: {
            status: 503,
            name: 'MaintenanceModeError',
            message: settings.maintenance_message,
          },
        };
        return;
      }

      return next();
    });
  },

  async bootstrap({ strapi }: { strapi: any }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    // Collection types get both `find` and `findOne`.
    const publicReadableCollections = [
      'api::currency.currency',
      'api::country.country',
      'api::skills-catalog.skills-catalog',
    ];

    // Single types only have a `find` action — there is no `findOne` for
    // them, since there's only ever one record. Trying to enable a
    // `.findOne` permission that doesn't exist is what threw
    // "Update requires data" here.
    const publicReadableSingleTypes = ['api::admn-setting.admn-setting'];

    const enablePermission = async (permissionUid: string) => {
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { role: publicRole.id, action: permissionUid } });

      if (!existing) {
        strapi.log.warn(`Permission not found, skipping: ${permissionUid}`);
        return;
      }

      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: existing.id },
        data: { enabled: true },
      });
    };

    for (const uid of publicReadableCollections) {
      await enablePermission(`${uid}.find`);
      await enablePermission(`${uid}.findOne`);
    }

    for (const uid of publicReadableSingleTypes) {
      await enablePermission(`${uid}.find`);
    }

    strapi.log.info('AfriGigs bootstrap: public read permissions verified for reference data.');
  },
};