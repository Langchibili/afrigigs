// // src/api/escrow-transaction/controllers/escrow-transaction.ts

// import { factories } from '@strapi/strapi';

// export default factories.createCoreController('api::escrow-transaction.escrow-transaction', ({ strapi }) => ({
//     /**
//      * Job-poster-only. Moves held escrow into the assigned worker's Wallet
//      * and closes out the job.
//      */
//     async release(ctx) {
//         try {
//             const { id } = ctx.params;
//             const requester = ctx.state.user;

//             const transaction: any = await strapi.db.query('api::escrow-transaction.escrow-transaction').findOne({
//                 where: { id },
//                 populate: { job: { populate: ['owner', 'assigned_worker'] }, currency: true },
//             });

//             if (!transaction) return ctx.notFound('Escrow transaction not found.');
//             if (transaction.status !== 'held' && transaction.status !== 'funded') {
//                 return ctx.badRequest(`Transaction is already ${transaction.status}.`);
//             }

//             const job = transaction.job;
//             if (!job || !job.owner) return ctx.badRequest('Escrow transaction is not linked to a valid job.');
//             if (requester && job.owner.id !== requester.id) {
//                 return ctx.forbidden('Only the job poster can release escrow funds.');
//             }
//             if (!job.assigned_worker) return ctx.badRequest('Job has no assigned worker to release funds to.');

//             const workerId = job.assigned_worker.id;

//             let wallet: any = await strapi.db.query('api::wallet.wallet').findOne({
//                 where: { user: workerId },
//             });

//             if (!wallet) {
//                 wallet = await strapi.db.query('api::wallet.wallet').create({
//                     data: { user: workerId, balance: 0, pending_balance: 0, currency: transaction.currency?.id },
//                 });
//             }

//             await strapi.db.query('api::wallet.wallet').update({
//                 where: { id: wallet.id },
//                 data: { balance: Number(wallet.balance) + Number(transaction.amount) },
//             });

//             await strapi.db.query('api::escrow-transaction.escrow-transaction').update({
//                 where: { id },
//                 data: { status: 'released' },
//             });

//             await strapi.db.query('api::job.job').update({
//                 where: { id: job.id },
//                 data: { job_status: 'completed', escrow_status: 'released', completed_at: new Date() },
//             });

//             ctx.send({
//                 success: true,
//                 data: { released: true, walletId: wallet.id, amount: transaction.amount },
//             });
//         } catch (error) {
//             strapi.log.error('Error releasing escrow:', error);
//             ctx.internalServerError('Failed to release escrow');
//         }
//     },
// }));
// src/api/escrow-transaction/controllers/escrow-transaction.ts

import { factories } from '@strapi/strapi';
import { getSettings } from '../../../services/settingsService';

export default factories.createCoreController('api::escrow-transaction.escrow-transaction', ({ strapi }) => ({
    async release(ctx) {
        try {
            const { id } = ctx.params;
            const requester = ctx.state.user;
            const settings = await getSettings();

            const transaction: any = await strapi.db.query('api::escrow-transaction.escrow-transaction').findOne({
                where: { id },
                populate: { job: { populate: ['owner', 'assigned_worker'] }, currency: true },
            });

            if (!transaction) return ctx.notFound('Escrow transaction not found.');
            if (transaction.status !== 'held' && transaction.status !== 'funded') {
                return ctx.badRequest(`Transaction is already ${transaction.status}.`);
            }

            const job = transaction.job;
            if (!job || !job.owner) return ctx.badRequest('Escrow transaction is not linked to a valid job.');
            if (requester && job.owner.id !== requester.id) {
                return ctx.forbidden('Only the job poster can release escrow funds.');
            }
            if (!job.assigned_worker) return ctx.badRequest('Job has no assigned worker to release funds to.');

            const workerId = job.assigned_worker.id;

            const feePercentage = Number(settings.platform_fee_percentage) || 0;
            const grossAmount = Number(transaction.amount);
            const feeAmount = Math.round(grossAmount * (feePercentage / 100) * 100) / 100;
            const netAmount = Math.round((grossAmount - feeAmount) * 100) / 100;

            let wallet: any = await strapi.db.query('api::wallet.wallet').findOne({
                where: { user: workerId },
            });

            if (!wallet) {
                wallet = await strapi.db.query('api::wallet.wallet').create({
                    data: { user: workerId, balance: 0, pending_balance: 0, currency: transaction.currency?.id },
                });
            }

            await strapi.db.query('api::wallet.wallet').update({
                where: { id: wallet.id },
                data: { balance: Number(wallet.balance) + netAmount },
            });

            await strapi.db.query('api::escrow-transaction.escrow-transaction').update({
                where: { id },
                data: { status: 'released' },
            });

            await strapi.db.query('api::job.job').update({
                where: { id: job.id },
                data: { job_status: 'completed', escrow_status: 'released', completed_at: new Date() },
            });

            ctx.send({
                success: true,
                data: {
                    released: true,
                    walletId: wallet.id,
                    grossAmount,
                    platformFeePercentage: feePercentage,
                    feeAmount,
                    netAmount,
                },
            });
        } catch (error) {
            strapi.log.error('Error releasing escrow:', error);
            ctx.internalServerError('Failed to release escrow');
        }
    },
}));