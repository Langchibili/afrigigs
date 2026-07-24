// src/api/verification-submission/content-types/verification-submission/lifecycles.ts

export default {
    /**
     * Flipping a submission's status to 'approved' automatically marks the
     * related user as verified and stamps the review time.
     */
    async afterUpdate(event: any) {
        const { result, params } = event;

        const newStatus = params?.data?.verification_status;
        if (newStatus !== 'approved') return;

        const submission: any = await strapi.db
            .query('api::verification-submission.verification-submission')
            .findOne({
                where: { id: result.id },
                populate: ['user'],
            });

        if (!submission?.user) return;

        await strapi.db.query('plugin::users-permissions.user').update({
            where: { id: submission.user.id },
            data: { is_verified_human: true },
        });

        await strapi.db.query('api::verification-submission.verification-submission').update({
            where: { id: submission.id },
            data: { reviewed_at: new Date() },
        });
    },
};