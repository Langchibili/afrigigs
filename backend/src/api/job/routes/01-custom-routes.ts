// src/api/job/routes/01-custom-routes.ts

export default {
    routes: [
        {
            method: 'GET',
            path: '/jobs/:id/rank-bids',
            handler: 'job.rankBids',
            config: { policies: [], middlewares: [] },
        },
    ],
};