// src/api/job/content-types/job/lifecycles.ts

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

        // Enforce minimum job budget, expressed in USD regardless of the
        // job's posting currency.
        const currencyId = extractId(data.budget_currency);
        if (currencyId && data.budget_amount !== undefined) {
            const currency: any = await strapi.db.query('api::currency.currency').findOne({
                where: { id: currencyId },
            });

            if (currency?.code) {
                try {
                    const budgetUsd = await convertAmount(Number(data.budget_amount), currency.code, 'USD');
                    if (budgetUsd < settings.min_job_amount_usd) {
                        throw new Error(
                            `Job budget must be at least $${settings.min_job_amount_usd.toFixed(2)} USD equivalent.`
                        );
                    }
                } catch (err: any) {
                    if (err.message?.startsWith('Exchange rate')) {
                        strapi.log.error('Currency conversion failed during job validation:', err);
                        // Don't hard-block job creation on a transient FX outage —
                        // log and allow through, unlike the bid path where the
                        // amount itself is the whole point of the transaction.
                    } else {
                        throw err;
                    }
                }
            }
        }

        // Enforce poster verification requirement, if enabled.
        const ownerId = extractId(data.owner);
        if (settings.require_verification_to_post_job && ownerId) {
            const owner: any = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: ownerId },
            });
            if (owner && !owner.is_verified_human) {
                throw new Error('You must complete verification before posting a job.');
            }
        }
    },
};