// src/api/escrow-transaction/routes/01-custom-routes.ts

export default {
    routes: [
        {
            method: 'POST',
            path: '/escrow-transactions/:id/release',
            handler: 'escrow-transaction.release',
            config: { policies: [], middlewares: [] },
        },
    ],
};