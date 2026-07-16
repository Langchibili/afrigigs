// src/api/review/content-types/review/lifecycles.ts

export default {
    /**
     * A 4-5 star review increments the recipient's trust_score_yes, which
     * feeds directly into the job.rankBids proximity/trust sort algorithm.
     */
    async afterCreate(event: any) {
        const { result } = event;

        const rating = result?.rating;
        if (!rating || rating < 4) return;

        const review: any = await strapi.db.query('api::review.review').findOne({
            where: { id: result.id },
            populate: ['to_user'],
        });

        const toUserId = review?.to_user?.id;
        if (!toUserId) return;

        const user: any = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: toUserId },
        });
        if (!user) return;

        await strapi.db.query('plugin::users-permissions.user').update({
            where: { id: toUserId },
            data: { trust_score_yes: (user.trust_score_yes || 0) + 1 },
        });
    },
};