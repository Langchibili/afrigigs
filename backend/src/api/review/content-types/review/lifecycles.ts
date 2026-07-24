// src/api/review/content-types/review/lifecycles.ts

import { getSettings } from '../../../../services/settingsService';

export default {
    async afterCreate(event: any) {
        const { result } = event;
        const settings = await getSettings();

        const rating = result?.rating;
        if (!rating || rating < settings.review_positive_threshold) return;

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