// src/api/bid/content-types/bid/lifecycles.ts

const FIXED_USD_MIN = 5.0;

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
    /**
     * Enforces the national vs. international bid floor:
     *   - International (job owner country !== bidder country): min $5.00 USD
     *   - Domestic: min = country.currency.minimum_national_bid (local currency)
     * Also blocks bids on closed jobs and self-bids.
     */
    async beforeCreate(event: any) {
        const { data } = event.params;

        const jobId = extractId(data.job);
        const userId = extractId(data.user);

        if (!jobId || !userId) {
            throw new Error('A bid requires both a job and a user.');
        }

        const job: any = await strapi.db.query('api::job.job').findOne({
            where: { id: jobId },
            populate: { owner: { populate: ['country'] }, country: { populate: ['currency'] } },
        });

        if (!job) throw new Error('Cannot bid on a job that does not exist.');
        if (job.status !== 'open') throw new Error('This job is no longer accepting bids.');

        const bidder: any = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            populate: ['country'],
        });

        if (!bidder) throw new Error('Bidder account could not be resolved.');
        if (job.owner && job.owner.id === bidder.id) {
            throw new Error('You cannot bid on your own job.');
        }

        const ownerCountryId = job.owner?.country?.id ?? null;
        const bidderCountryId = bidder.country?.id ?? null;
        const isInternational = ownerCountryId !== bidderCountryId;

        if (isInternational) {
            const proposedUsd = Number(data.proposed_amount_usd);
            if (!proposedUsd || proposedUsd < FIXED_USD_MIN) {
                throw new Error(
                    `International bids must meet the minimum fallback rate of $${FIXED_USD_MIN.toFixed(2)} USD.`
                );
            }
        } else {
            const domesticMin = job.country?.currency ? Number(job.country.currency.minimum_national_bid) : 0;
            const proposedLocal = Number(data.proposed_amount_local);
            const symbol = job.country?.currency ? job.country.currency.symbol : '';

            if (!proposedLocal || proposedLocal < domesticMin) {
                throw new Error(`Bid rejected. The domestic floor limit for this area is ${symbol}${domesticMin}.`);
            }
        }
    },

    /**
     * Bid amounts are immutable once submitted — withdraw and re-bid instead
     * of editing, so the floor-check above can't be bypassed via update.
     */
    async beforeUpdate(event: any) {
        const { data } = event.params;
        if (data && (data.proposed_amount_local !== undefined || data.proposed_amount_usd !== undefined)) {
            throw new Error('Bid amounts cannot be edited after submission. Withdraw and re-bid instead.');
        }
    },
};