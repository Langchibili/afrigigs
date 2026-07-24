// src/api/bid/content-types/bid/lifecycles.ts

import { convertAmount } from '../../../../services/exchangeRateService';
import { getSettings } from '../../../../services/settingsService';

function extractId(relation: any): number | null {
    if (relation === null || relation === undefined) return null;
    if (typeof relation === 'number') return relation;
    if (typeof relation === 'string') return Number(relation);
    if (relation.id) return relation.id;
    if (Array.isArray(relation.connect) && relation.connect[0]) {
        return relation.connect[0].id ?? relation.connect[0];
    }
    return null;
}

export default {
    async beforeCreate(event: any) {
        const { data } = event.params;
        const settings = await getSettings();

        const jobId = extractId(data.job);
        const userId = extractId(data.user);

        if (!jobId || !userId) {
            throw new Error('A bid requires both a job and a user.');
        }

        const job: any = await strapi.db.query('api::job.job').findOne({
            where: { id: jobId },
            populate: {
                owner: { populate: ['country'] },
                country: { populate: ['currency'] },
                budget_currency: true,
            },
        });

        if (!job) throw new Error('Cannot bid on a job that does not exist.');
        if (job.job_status !== 'open') throw new Error('This job is no longer accepting bids.');

        const bidder: any = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            populate: ['country'],
        });

        if (!bidder) throw new Error('Bidder account could not be resolved.');
        if (job.owner && job.owner.id === bidder.id) {
            throw new Error('You cannot bid on your own job.');
        }

        if (settings.require_verification_to_bid && !bidder.is_verified_human) {
            throw new Error('You must complete verification before placing bids.');
        }

        const activeBidCount = await strapi.db.query('api::bid.bid').count({
            where: { user: userId, status: 'pending' },
        });
        if (activeBidCount >= settings.max_active_bids_per_user) {
            throw new Error(
                `You have reached the maximum of ${settings.max_active_bids_per_user} active bids. Withdraw an existing bid before placing a new one.`
            );
        }

        const localCurrency = job.budget_currency || job.country?.currency;
        const localCurrencyCode = localCurrency?.code;

        const ownerCountryId = job.owner?.country?.id ?? null;
        const bidderCountryId = bidder.country?.id ?? null;
        const isInternational = ownerCountryId !== bidderCountryId;

        let proposedUsd =
            data.proposed_amount_usd !== undefined && data.proposed_amount_usd !== null
                ? Number(data.proposed_amount_usd)
                : null;
        let proposedLocal =
            data.proposed_amount_local !== undefined && data.proposed_amount_local !== null
                ? Number(data.proposed_amount_local)
                : null;

        if (!proposedUsd && !proposedLocal) {
            throw new Error('A bid must include either proposed_amount_local or proposed_amount_usd.');
        }

        if (!localCurrencyCode) {
            strapi.log.warn(`Job ${job.id} has no resolvable currency code; skipping currency conversion.`);
        }

        try {
            if (isInternational) {
                if (proposedUsd === null && proposedLocal !== null && localCurrencyCode) {
                    proposedUsd = await convertAmount(proposedLocal, localCurrencyCode, 'USD');
                }
                if (proposedLocal === null && proposedUsd !== null && localCurrencyCode) {
                    proposedLocal = await convertAmount(proposedUsd, 'USD', localCurrencyCode);
                }

                if (!proposedUsd || proposedUsd < settings.min_bid_amount_usd) {
                    throw new Error(
                        `International bids must meet the minimum fallback rate of $${settings.min_bid_amount_usd.toFixed(2)} USD.`
                    );
                }
            } else {
                if (proposedLocal === null && proposedUsd !== null && localCurrencyCode) {
                    proposedLocal = await convertAmount(proposedUsd, 'USD', localCurrencyCode);
                }
                if (proposedUsd === null && proposedLocal !== null && localCurrencyCode) {
                    proposedUsd = await convertAmount(proposedLocal, localCurrencyCode, 'USD');
                }

                const domesticMin = localCurrency ? Number(localCurrency.minimum_national_bid) : 0;
                const symbol = localCurrency ? localCurrency.symbol : '';

                if (!proposedLocal || proposedLocal < domesticMin) {
                    throw new Error(`Bid rejected. The domestic floor limit for this area is ${symbol}${domesticMin}.`);
                }
            }
        } catch (err: any) {
            if (err.message?.startsWith('Exchange rate')) {
                strapi.log.error('Currency conversion failed during bid validation:', err);
                throw new Error(
                    'Could not verify the bid amount right now (currency conversion unavailable). Please try again shortly.'
                );
            }
            throw err;
        }

        data.proposed_amount_usd = proposedUsd;
        data.proposed_amount_local = proposedLocal;
    },

    async beforeUpdate(event: any) {
        const { data } = event.params;
        const settings = await getSettings();

        if (data && (data.proposed_amount_local !== undefined || data.proposed_amount_usd !== undefined)) {
            throw new Error('Bid amounts cannot be edited after submission. Withdraw and re-bid instead.');
        }

        if (data?.status === 'withdrawn' && !settings.bid_withdrawal_allowed) {
            throw new Error('Bid withdrawals are currently disabled. Please contact support.');
        }
    },
};