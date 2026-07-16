// src/extensions/users-permissions/strapi-server.ts

/**
 * Adds POST /api/users/me/location. The RN wrapper posts raw
 * { latitude, longitude }; the server reverse-geocodes and stores ONLY
 * the resolved city (native_last_city). Raw coordinates are never
 * persisted or returned
 */
export default (plugin: any) => {
  plugin.controllers.user.updateMyLocation = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in to update location.');

      const { latitude, longitude } = ctx.request.body || {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return ctx.badRequest('latitude and longitude (numbers) are required.');
      }

      const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
      if (!apiKey) {
        strapi.log.error('GOOGLE_GEOCODING_API_KEY is not configured.');
        return ctx.internalServerError('Location service is not configured.');
      }

      let resolvedCity: string | null = null;
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality&key=${apiKey}`;
        const response = await fetch(url);
        const geo: any = await response.json();
        const localityComponent = geo?.results?.[0]?.address_components?.find((c: any) =>
          c.types.includes('locality')
        );
        resolvedCity = localityComponent ? localityComponent.long_name : null;
      } catch (err) {
        strapi.log.error('Reverse geocoding failed', err);
        return ctx.internalServerError('Could not resolve location.');
      }

      if (!resolvedCity) return ctx.badRequest('Could not resolve a city for the given coordinates.');

      const updated: any = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: { native_last_city: resolvedCity },
      });

      ctx.send({ success: true, native_last_city: updated.native_last_city });
    } catch (error) {
      strapi.log.error('Error updating user location:', error);
      ctx.internalServerError('Failed to update user location');
    }
  };

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/users/me/location',
    handler: 'user.updateMyLocation',
    config: { policies: [], middlewares: [], prefix: '' },
  });

  return plugin;
};