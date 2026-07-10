'use strict';

/**
 * escrow-transaction controller
 *
 * Adds a `release` action implementing the blueprint's release phase:
 * once a job poster confirms completion, the held escrow balance moves
 * into the assigned worker's Wallet and both the transaction and the
 * parent job are marked accordingly.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::escrow-transaction.escrow-transaction', ({ strapi }) => ({
  async release(ctx) {
    const { id } = ctx.params;
    const requester = ctx.state.user;

    const transaction = await strapi.entityService.findOne('api::escrow-transaction.escrow-transaction', id, {
      populate: { job: { populate: ['owner', 'assigned_worker'] }, currency: true },
    });

    if (!transaction) {
      return ctx.notFound('Escrow transaction not found.');
    }

    if (transaction.status !== 'held' && transaction.status !== 'funded') {
      return ctx.badRequest(`Transaction is already ${transaction.status}.`);
    }

    const job = transaction.job;
    if (!job || !job.owner) {
      return ctx.badRequest('Escrow transaction is not linked to a valid job.');
    }

    // Only the job poster (or an authenticated service/admin call) may release funds.
    if (requester && job.owner.id !== requester.id) {
      return ctx.forbidden('Only the job poster can release escrow funds.');
    }

    if (!job.assigned_worker) {
      return ctx.badRequest('Job has no assigned worker to release funds to.');
    }

    const workerId = job.assigned_worker.id;

    const wallets = await strapi.entityService.findMany('api::wallet.wallet', {
      filters: { user: workerId },
      limit: 1,
    });

    let wallet = wallets && wallets[0];
    if (!wallet) {
      wallet = await strapi.entityService.create('api::wallet.wallet', {
        data: { user: workerId, balance: 0, pending_balance: 0, currency: transaction.currency?.id },
      });
    }

    await strapi.entityService.update('api::wallet.wallet', wallet.id, {
      data: { balance: Number(wallet.balance) + Number(transaction.amount) },
    });

    await strapi.entityService.update('api::escrow-transaction.escrow-transaction', id, {
      data: { status: 'released' },
    });

    await strapi.entityService.update('api::job.job', job.id, {
      data: { status: 'completed', escrow_status: 'released', completed_at: new Date() },
    });

    ctx.body = { data: { released: true, wallet_id: wallet.id, amount: transaction.amount } };
  },
}));
