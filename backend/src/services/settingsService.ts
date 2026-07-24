// src/services/settingsService.ts

/**
 * Cached reader for the singleton AdmnSetting record. Deliberately named
 * "admn" (not "admin") to stay unambiguous from Strapi's own admin panel
 * throughout the codebase — see admn-setting/schema.json.
 *
 * Cached for SETTINGS_CACHE_MS so every bid/job/escrow write doesn't hit
 * the DB for config that changes rarely. Call invalidateSettingsCache()
 * after any programmatic write to admn-setting (not needed for changes
 * made through the admin panel — those go through a fresh request anyway
 * once the cache expires).
 */

const SETTINGS_CACHE_MS = 60 * 1000; // 1 minute — short enough that admin changes take effect quickly

export interface AdmnSettings {
    min_bid_amount_usd: number;
    min_job_amount_usd: number;
    platform_fee_percentage: number;
    escrow_auto_dispute_hours: number;
    require_verification_to_bid: boolean;
    require_verification_to_post_job: boolean;
    max_active_bids_per_user: number;
    bid_withdrawal_allowed: boolean;
    review_positive_threshold: number;
    exchange_rate_cache_hours: number;
    maintenance_mode: boolean;
    maintenance_message: string;
    support_email: string | null;
    support_phone: string | null;
    app_min_supported_version: string | null;
    force_update: boolean;
    default_currency: any;
}

const DEFAULTS: AdmnSettings = {
    min_bid_amount_usd: 1.5,
    min_job_amount_usd: 2.0,
    platform_fee_percentage: 10.0,
    escrow_auto_dispute_hours: 72,
    require_verification_to_bid: false,
    require_verification_to_post_job: false,
    max_active_bids_per_user: 20,
    bid_withdrawal_allowed: true,
    review_positive_threshold: 4,
    exchange_rate_cache_hours: 12,
    maintenance_mode: false,
    maintenance_message: 'AfriGigs is currently undergoing scheduled maintenance. Please check back shortly.',
    support_email: null,
    support_phone: null,
    app_min_supported_version: null,
    force_update: false,
    default_currency: null,
};

let cached: AdmnSettings = DEFAULTS;
let cachedAt = 0;

export async function getSettings(): Promise<AdmnSettings> {
    if (Date.now() - cachedAt < SETTINGS_CACHE_MS) {
        return cached;
    }

    try {
        const record: any = await strapi.db.query('api::admn-setting.admn-setting').findOne({
            populate: ['default_currency'],
        });

        cached = record ? { ...DEFAULTS, ...record } : DEFAULTS;
    } catch (err) {
        strapi.log.error('Failed to load admn-settings, falling back to defaults:', err);
        cached = DEFAULTS;
    }

    cachedAt = Date.now();
    return cached;
}

export function invalidateSettingsCache(): void {
    cached = DEFAULTS;
    cachedAt = 0;
}