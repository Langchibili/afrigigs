'use strict';

/**
 * Extends the users-permissions plugin with a single custom, authenticated
 * endpoint: POST /api/users/me/location
 *
 * The React Native wrapper posts raw { latitude, longitude } here. The
 * server reverse-geocodes them via the Google Geocoding API and stores
 * ONLY the resolved city string on the user record (`native_last_city`).
 * Raw coordinates are never persisted and never returned to any client,
 * including the submitting user's own subsequent reads.
 */

module.exports = (plugin) => {
  plugin.controllers.user.updateMyLocation = async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to update location.');
    }

    const { latitude, longitude } = ctx.request.body || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return ctx.badRequest('latitude and longitude (numbers) are required.');
    }

    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    if (!apiKey) {
      strapi.log.error('GOOGLE_GEOCODING_API_KEY is not configured.');
      return ctx.internalServerError('Location service is not configured.');
    }

    let resolvedCity = null;

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality&key=${apiKey}`;
      const response = await fetch(url);
      const geo = await response.json();

      const localityComponent = geo?.results?.[0]?.address_components?.find((c) =>
        c.types.includes('locality')
      );

      resolvedCity = localityComponent ? localityComponent.long_name : null;
    } catch (err) {
      strapi.log.error('Reverse geocoding failed', err);
      return ctx.internalServerError('Could not resolve location.');
    }

    if (!resolvedCity) {
      return ctx.badRequest('Could not resolve a city for the given coordinates.');
    }

    const updated = await strapi.entityService.update(
      'plugin::users-permissions.user',
      user.id,
      { data: { native_last_city: resolvedCity } }
    );

    // Deliberately omit lat/lng from the response payload.
    ctx.body = { native_last_city: updated.native_last_city };
  };

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/users/me/location',
    handler: 'user.updateMyLocation',
    config: {
      policies: [],
      prefix: '',
    },
  });

  return plugin;
};
