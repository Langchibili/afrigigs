// // src/extensions/users-permissions/strapi-server.ts

// /**
//  * Custom /users/me/* and /users/:id/reviews routes.
//  *
//  * Why these exist: Strapi's Content API sanitizer refuses to filter any
//  * collection through a relation that targets plugin::users-permissions.user
//  * — e.g. GET /api/jobs?filters[owner]=1 or GET /api/wallets?filters[user]=1
//  * both fail with "Invalid key owner"/"Invalid key user", no matter how the
//  * filter is nested (flat FK or [id]). This is enforced regardless of
//  * permissions config — it isn't something a role/policy tweak fixes.
//  *
//  * The routes below sidestep the sanitizer entirely by querying with the
//  * low-level Query Engine (strapi.db.query(...).findMany/findOne), which
//  * isn't subject to that restriction, and scoping every query to the
//  * authenticated user (ctx.state.user.id) so no one can read another
//  * user's jobs/wallet/bids/conversations through this route.
//  */
// export default (plugin: any) => {
//   // --- existing location endpoint -----------------------------------------
//   plugin.controllers.user.updateMyLocation = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized('You must be logged in to update location.');

//       const { latitude, longitude } = ctx.request.body || {};
//       if (typeof latitude !== 'number' || typeof longitude !== 'number') {
//         return ctx.badRequest('latitude and longitude (numbers) are required.');
//       }

//       const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
//       if (!apiKey) {
//         strapi.log.error('GOOGLE_GEOCODING_API_KEY is not configured.');
//         return ctx.internalServerError('Location service is not configured.');
//       }

//       let resolvedCity: string | null = null;
//       try {
//         const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality&key=${apiKey}`;
//         const response = await fetch(url);
//         const geo: any = await response.json();
//         const localityComponent = geo?.results?.[0]?.address_components?.find((c: any) =>
//           c.types.includes('locality')
//         );
//         resolvedCity = localityComponent ? localityComponent.long_name : null;
//       } catch (err) {
//         strapi.log.error('Reverse geocoding failed', err);
//         return ctx.internalServerError('Could not resolve location.');
//       }

//       if (!resolvedCity) return ctx.badRequest('Could not resolve a city for the given coordinates.');

//       const updated: any = await strapi.db.query('plugin::users-permissions.user').update({
//         where: { id: user.id },
//         data: { native_last_city: resolvedCity },
//       });

//       ctx.send({ success: true, native_last_city: updated.native_last_city });
//     } catch (error) {
//       strapi.log.error('Error updating user location:', error);
//       ctx.internalServerError('Failed to update user location');
//     }
//   };

//   // --- GET /users/me/jobs?role=owner|assigned -------------------------------
//   plugin.controllers.user.myJobs = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized();

//       const relationField = ctx.query.role === 'assigned' ? 'assigned_worker' : 'owner';
//       const pageSize = Number(ctx.query.pageSize) || 12;

//       const jobs = await strapi.db.query('api::job.job').findMany({
//         where: { [relationField]: user.id },
//         populate: ['budget_currency', 'skills_required', 'country'],
//         orderBy: { createdAt: 'desc' },
//         limit: pageSize,
//       });

//       ctx.send({ data: jobs });
//     } catch (error) {
//       strapi.log.error('Error fetching my jobs:', error);
//       ctx.internalServerError('Failed to fetch jobs');
//     }
//   };

//   // --- GET /users/me/wallet --------------------------------------------------
//   plugin.controllers.user.myWallet = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized();

//       const wallet = await strapi.db.query('api::wallet.wallet').findOne({
//         where: { user: user.id },
//         populate: ['currency'],
//       });

//       ctx.send({ data: wallet });
//     } catch (error) {
//       strapi.log.error('Error fetching my wallet:', error);
//       ctx.internalServerError('Failed to fetch wallet');
//     }
//   };

//   // --- GET /users/me/escrow-transactions -------------------------------------
//   plugin.controllers.user.myEscrowTransactions = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized();

//       const transactions = await strapi.db.query('api::escrow-transaction.escrow-transaction').findMany({
//         where: { job: { owner: user.id } },
//         populate: ['job', 'currency'],
//         orderBy: { createdAt: 'desc' },
//       });

//       ctx.send({ data: transactions });
//     } catch (error) {
//       strapi.log.error('Error fetching my escrow transactions:', error);
//       ctx.internalServerError('Failed to fetch escrow transactions');
//     }
//   };

//   // --- GET /users/me/bids -----------------------------------------------------
//   plugin.controllers.user.myBids = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized();

//       const bids = await strapi.db.query('api::bid.bid').findMany({
//         where: { user: user.id },
//         populate: ['job'],
//         orderBy: { createdAt: 'desc' },
//       });

//       ctx.send({ data: bids });
//     } catch (error) {
//       strapi.log.error('Error fetching my bids:', error);
//       ctx.internalServerError('Failed to fetch bids');
//     }
//   };

//   // --- GET /users/me/conversations --------------------------------------------
//   plugin.controllers.user.myConversations = async (ctx: any) => {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized();

//       const conversations = await strapi.db.query('api::conversation.conversation').findMany({
//         where: { participants: { id: user.id } },
//         populate: ['job', 'participants', 'messages'],
//       });

//       ctx.send({ data: conversations });
//     } catch (error) {
//       strapi.log.error('Error fetching my conversations:', error);
//       ctx.internalServerError('Failed to fetch conversations');
//     }
//   };

//   // --- GET /users/:id/reviews (public — shown on a profile page) -------------
//   plugin.controllers.user.userReviews = async (ctx: any) => {
//     try {
//       const { id } = ctx.params;

//       const reviews = await strapi.db.query('api::review.review').findMany({
//         where: { to_user: id },
//         populate: ['from_user'],
//         orderBy: { createdAt: 'desc' },
//       });

//       ctx.send({ data: reviews });
//     } catch (error) {
//       strapi.log.error('Error fetching user reviews:', error);
//       ctx.internalServerError('Failed to fetch reviews');
//     }
//   };

//   plugin.routes['content-api'].routes.push(
//     {
//       method: 'POST',
//       path: '/users/me/location',
//       handler: 'user.updateMyLocation',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/me/jobs',
//       handler: 'user.myJobs',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/me/wallet',
//       handler: 'user.myWallet',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/me/escrow-transactions',
//       handler: 'user.myEscrowTransactions',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/me/bids',
//       handler: 'user.myBids',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/me/conversations',
//       handler: 'user.myConversations',
//       config: { policies: [], middlewares: [], prefix: '' },
//     },
//     {
//       method: 'GET',
//       path: '/users/:id/reviews',
//       handler: 'user.userReviews',
//       config: { policies: [], middlewares: [], prefix: '' },
//     }
//   );

//   return plugin;
// };
// src/extensions/users-permissions/strapi-server.ts

/**
 * Custom /users/me/* and /users/:id/reviews routes.
 *
 * Why these exist: Strapi's Content API sanitizer refuses to filter any
 * collection through a relation that targets plugin::users-permissions.user
 * — e.g. GET /api/jobs?filters[owner]=1 or GET /api/wallets?filters[user]=1
 * both fail with "Invalid key owner"/"Invalid key user", no matter how the
 * filter is nested. This is enforced regardless of permissions config —
 * it isn't something a role/policy tweak fixes.
 *
 * The routes below sidestep the sanitizer entirely by querying with the
 * low-level Query Engine (strapi.db.query(...).findMany/findOne), which
 * isn't subject to that restriction, and scoping every "me" query to the
 * authenticated user (ctx.state.user.id) so no one can read another
 * user's jobs/wallet/bids/conversations through this route.
 *
 * documentId note: the frontend now links/relates entities by their
 * Strapi v5 documentId rather than the numeric id. Routes driven by
 * ctx.state.user (the "me" routes, and updateMyLocation) are unaffected,
 * since ctx.state.user.id comes from the JWT, not the URL. userReviews,
 * however, takes its target user from the URL (":id" segment) — that
 * value now arrives as a documentId, so it's resolved to the numeric row
 * id first before filtering Review.to_user (a raw relation column).
 */
export default (plugin: any) => {
  // --- POST /users/me/location -------------------------------------------
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

  // --- GET /users/me/jobs?role=owner|assigned -------------------------------
  plugin.controllers.user.myJobs = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const relationField = ctx.query.role === 'assigned' ? 'assigned_worker' : 'owner';
      const pageSize = Number(ctx.query.pageSize) || 12;

      const jobs = await strapi.db.query('api::job.job').findMany({
        where: { [relationField]: user.id },
        populate: ['budget_currency', 'skills_required', 'country'],
        orderBy: { createdAt: 'desc' },
        limit: pageSize,
      });

      ctx.send({ data: jobs });
    } catch (error) {
      strapi.log.error('Error fetching my jobs:', error);
      ctx.internalServerError('Failed to fetch jobs');
    }
  };

  // --- GET /users/me/wallet --------------------------------------------------
  plugin.controllers.user.myWallet = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const wallet = await strapi.db.query('api::wallet.wallet').findOne({
        where: { user: user.id },
        populate: ['currency'],
      });

      ctx.send({ data: wallet });
    } catch (error) {
      strapi.log.error('Error fetching my wallet:', error);
      ctx.internalServerError('Failed to fetch wallet');
    }
  };

  // --- GET /users/me/escrow-transactions -------------------------------------
  plugin.controllers.user.myEscrowTransactions = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const transactions = await strapi.db.query('api::escrow-transaction.escrow-transaction').findMany({
        where: { job: { owner: user.id } },
        populate: ['job', 'currency'],
        orderBy: { createdAt: 'desc' },
      });

      ctx.send({ data: transactions });
    } catch (error) {
      strapi.log.error('Error fetching my escrow transactions:', error);
      ctx.internalServerError('Failed to fetch escrow transactions');
    }
  };

  // --- GET /users/me/bids -----------------------------------------------------
  plugin.controllers.user.myBids = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const bids = await strapi.db.query('api::bid.bid').findMany({
        where: { user: user.id },
        populate: ['job'],
        orderBy: { createdAt: 'desc' },
      });

      ctx.send({ data: bids });
    } catch (error) {
      strapi.log.error('Error fetching my bids:', error);
      ctx.internalServerError('Failed to fetch bids');
    }
  };

  // --- GET /users/me/conversations --------------------------------------------
  plugin.controllers.user.myConversations = async (ctx: any) => {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const conversations = await strapi.db.query('api::conversation.conversation').findMany({
        where: { participants: { id: user.id } },
        populate: ['job', 'participants', 'messages'],
      });

      ctx.send({ data: conversations });
    } catch (error) {
      strapi.log.error('Error fetching my conversations:', error);
      ctx.internalServerError('Failed to fetch conversations');
    }
  };

  // --- GET /users/:id/reviews (public — shown on a profile page) -------------
  // ":id" now arrives as the target user's documentId (profile links are
  // built from user.documentId on the frontend) — resolve it to the
  // user's numeric row id first, since Review.to_user is a raw FK column
  // that documentId can't be matched against directly.
  plugin.controllers.user.userReviews = async (ctx: any) => {
    try {
      const { id } = ctx.params;

      const targetUser: any = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { documentId: id },
        select: ['id'],
      });

      if (!targetUser) return ctx.notFound('User not found');

      const reviews = await strapi.db.query('api::review.review').findMany({
        where: { to_user: targetUser.id },
        populate: ['from_user'],
        orderBy: { createdAt: 'desc' },
      });

      ctx.send({ data: reviews });
    } catch (error) {
      strapi.log.error('Error fetching user reviews:', error);
      ctx.internalServerError('Failed to fetch reviews');
    }
  };

  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/users/me/location',
      handler: 'user.updateMyLocation',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/me/jobs',
      handler: 'user.myJobs',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/me/wallet',
      handler: 'user.myWallet',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/me/escrow-transactions',
      handler: 'user.myEscrowTransactions',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/me/bids',
      handler: 'user.myBids',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/me/conversations',
      handler: 'user.myConversations',
      config: { policies: [], middlewares: [], prefix: '' },
    },
    {
      method: 'GET',
      path: '/users/:id/reviews',
      handler: 'user.userReviews',
      config: { policies: [], middlewares: [], prefix: '' },
    }
  );

  return plugin;
};