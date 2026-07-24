// src/services/exchangeRateService.ts

import axios from 'axios';
// replace the top of the file with:
import { getSettings } from './settingsService';


/**
 * Wrapper around ExchangeRate-API's Pair Conversion endpoint
 * (https://www.exchangerate-api.com/docs/pair-conversion-requests).
 *
 * Rates are cached in-memory per currency pair for CACHE_TTL_MS since the
 * API only refreshes once every ~24h (time_next_update_unix) — re-fetching
 * on every bid would just burn quota for identical data.
 *
 * Currency.code values (ZMW, NGN, KES, GHS, ZAR, UGX, TZS, USD, ...) map
 * 1:1 onto ExchangeRate-API's supported_codes list, so no translation
 * layer is needed between the two.
 */

interface CachedRate {
    rate: number;
    fetchedAt: number;
}

const rateCache = new Map<string, { rate: number; fetchedAt: number }>();

function cacheKey(from: string, to: string): string {
    return `${from.toUpperCase()}_${to.toUpperCase()}`;
}

/** Returns the rate such that amountInTo = amountInFrom * rate. */
export async function getExchangeRate(from: string, to: string): Promise<number> {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    if (fromCode === toCode) return 1;

    const settings = await getSettings();
    const cacheTtlMs = settings.exchange_rate_cache_hours * 60 * 60 * 1000;

    const key = cacheKey(fromCode, toCode);
    const cached = rateCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < cacheTtlMs) {
        return cached.rate;
    }

    const apiKey = process.env.CURRENCYAPICONVERTERAPI;
    if (!apiKey) {
        throw new Error('CURRENCYAPICONVERTERAPI is not configured in the environment.');
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCode}/${toCode}`;

    let data: any;
    try {
        const response = await axios.get(url, { timeout: 8000 });
        data = response.data;
    } catch (err: any) {
        throw new Error(`Exchange rate request failed (${fromCode}->${toCode}): ${err.message || 'network error'}`);
    }

    if (data?.result !== 'success') {
        throw new Error(`Exchange rate lookup failed (${fromCode}->${toCode}): ${data?.['error-type'] || 'unknown error'}`);
    }

    const rate = Number(data.conversion_rate);
    if (!rate || Number.isNaN(rate)) {
        throw new Error(`Exchange rate lookup returned an invalid rate (${fromCode}->${toCode}).`);
    }

    rateCache.set(key, { rate, fetchedAt: Date.now() });
    return rate;
}

/** Converts `amount` from `from` currency to `to` currency, rounded to 2dp. */
export async function convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await getExchangeRate(from, to);
    return Math.round(amount * rate * 100) / 100;
}