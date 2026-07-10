'use strict';

/**
 * Bid lifecycles
 *
 * Enforces the national-vs-international bidding floor described in the
 * AfriGigs blueprint:
 *   - International bid (job owner country !== bidder country): fixed
 *     fallback minimum of $5.00 USD.
 *   - Domestic bid (same country): minimum = country.currency.minimum_national_bid,
 *     evaluated in local currency.
 *
 * Also blocks bidding on jobs that are no longer open, and blocks a user
 * from bidding on their own job.
 */

const FIXED_USD_MIN = 5.0;

async function resolveJob(strapi, jobId) {
  return strapi.entityService.findOne('api::job.job', jobId, {
    populate: {
      owner: { populate: ['country'] },
      country: { populate: ['currency'] },
    },
  });
}

async function resolveBidder(strapi, userId) {
  return strapi.entityService.findOne('plugin::users-permissions.user', userId, {
    populate: ['country'],
  });
}

function extractId(relation) {
  // Strapi relation payloads can arrive as a raw id, { id }, or { connect: [...] }
  if (relation === null || relation === undefined) return null;
  if (typeof relation === 'number' || typeof relation === 'string') return relation;
  if (relation.id) return relation.id;
  if (Array.isArray(relation.connect) && relation.connect[0]) {
    return relation.connect[0].id ?? relation.connect[0];
  }
  return null;
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const jobId = extractId(data.job);
    const userId = extractId(data.user);

    if (!jobId || !userId) {
      throw new Error('A bid requires both a job and a user.');
    }

    const job = await resolveJob(strapi, jobId);
    if (!job) {
      throw new Error('Cannot bid on a job that does not exist.');
    }

    if (job.status !== 'open') {
      throw new Error('This job is no longer accepting bids.');
    }

    const bidder = await resolveBidder(strapi, userId);
    if (!bidder) {
      throw new Error('Bidder account could not be resolved.');
    }

    if (job.owner && job.owner.id === bidder.id) {
      throw new Error('You cannot bid on your own job.');
    }

    const ownerCountryId = job.owner && job.owner.country ? job.owner.country.id : null;
    const bidderCountryId = bidder.country ? bidder.country.id : null;
    const isInternational = ownerCountryId !== bidderCountryId;

    if (isInternational) {
      const proposedUsd = Number(data.proposed_amount_usd);
      if (!proposedUsd || proposedUsd < FIXED_USD_MIN) {
        throw new Error(
          `International bids must meet the minimum fallback rate of $${FIXED_USD_MIN.toFixed(2)} USD.`
        );
      }
    } else {
      const domesticMin = job.country && job.country.currency
        ? Number(job.country.currency.minimum_national_bid)
        : 0;
      const proposedLocal = Number(data.proposed_amount_local);
      const symbol = job.country && job.country.currency ? job.country.currency.symbol : '';

      if (!proposedLocal || proposedLocal < domesticMin) {
        throw new Error(
          `Bid rejected. The domestic floor limit for this area is ${symbol}${domesticMin}.`
        );
      }
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    // Prevent tampering with amounts after creation via a bare status update;
    // only allow status transitions through this path.
    if (data && (data.proposed_amount_local !== undefined || data.proposed_amount_usd !== undefined)) {
      throw new Error('Bid amounts cannot be edited after submission. Withdraw and re-bid instead.');
    }
  },
};
