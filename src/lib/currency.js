/**
 * Currency helpers for the SOIL Studio store.
 *
 * The store's base currency is Naira (NGN) — every product's `price` is its Naira
 * price. USD prices are either set explicitly per product (`priceUsd`) or derived
 * from the Naira price using the exchange rate in Settings (`usd_rate`).
 */

export const CURRENCY_SYMBOL = { NGN: '₦', USD: '$' };

export const DEFAULT_USD_RATE = 1600;

/** A product's numeric price in the given currency (major units). */
export function convertPrice(product, currency, usdRate = DEFAULT_USD_RATE) {
    const ngn = Number(product?.price) || 0;
    if (currency === 'USD') {
        const override = product?.priceUsd;
        if (override != null && override !== '') return roundMoney(Number(override));
        const rate = Number(usdRate) || DEFAULT_USD_RATE;
        return roundMoney(ngn / rate);
    }
    return ngn;
}

/** Convert a base-currency (NGN) amount to the active currency. */
export function convertAmount(ngnAmount, currency, usdRate = DEFAULT_USD_RATE) {
    const n = Number(ngnAmount) || 0;
    if (currency === 'USD') return roundMoney(n / (Number(usdRate) || DEFAULT_USD_RATE));
    return n;
}

/** Format an amount with the currency symbol. NGN shows whole units; USD 2 dp. */
export function formatPrice(amount, currency) {
    const sym = CURRENCY_SYMBOL[currency] || '';
    const n = Number(amount) || 0;
    if (currency === 'USD') {
        const isWhole = Math.abs(n - Math.round(n)) < 0.005;
        return `${sym}${n.toLocaleString('en-US', {
            minimumFractionDigits: isWhole ? 0 : 2,
            maximumFractionDigits: 2,
        })}`;
    }
    return `${sym}${Math.round(n).toLocaleString('en-US')}`;
}

function roundMoney(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
}
