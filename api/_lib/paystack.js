/**
 * Shared Paystack helpers — used by the checkout, verify, and webhook endpoints.
 *
 * Paystack's REST API lives at https://api.paystack.co and authenticates with the
 * SECRET key as a Bearer token. There's no npm SDK needed — plain fetch is enough.
 *
 * Money note: Paystack works in the currency's SUBUNIT (kobo for NGN, cents for
 * USD) — always the major amount × 100.
 */

const PAYSTACK_BASE = 'https://api.paystack.co';

/** Call the Paystack API. Throws on a non-OK / non-success response. */
export async function paystackFetch(path, { method = 'GET', body, secretKey } = {}) {
    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    let json;
    try { json = await res.json(); }
    catch { throw new Error(`Paystack returned a non-JSON response (${res.status}).`); }

    if (!res.ok || json.status === false) {
        throw new Error(json.message || `Paystack request failed (${res.status}).`);
    }
    return json;
}

/** Convert a major-unit amount (₦, $) to Paystack's subunit (kobo, cents). */
export function toSubunit(amount) {
    return Math.round(Number(amount) * 100);
}

/**
 * The price of a product in the requested currency.
 *   NGN → the product's `price` (the primary Naira price).
 *   USD → `price_usd` if the admin set one, else derived from `price / usd_rate`.
 * Returns a major-unit number (e.g. 95 or 152000), rounded to 2 dp.
 */
export function priceInCurrency(product, currency, usdRate) {
    const ngn = Number(product.price) || 0;
    if (currency === 'USD') {
        if (product.price_usd != null && product.price_usd !== '') {
            return Math.round(Number(product.price_usd) * 100) / 100;
        }
        const rate = Number(usdRate) || 1600;
        return Math.round((ngn / rate) * 100) / 100;
    }
    return ngn;
}

/** Build trusted line items + total from the cart, pricing each item server-side. */
export async function buildOrder({ supa, items, currency, usdRate }) {
    const ids = [...new Set(items.map(i => i.id).filter(Boolean))];
    if (ids.length === 0) throw new Error('Cart is empty.');

    const { data: rows, error } = await supa
        .from('products')
        .select('*')
        .in('id', ids);
    if (error) throw new Error(`Could not read products: ${error.message}`);

    const byId = Object.fromEntries((rows || []).map(p => [String(p.id), p]));

    const lineItems = items.map(i => {
        const p = byId[String(i.id)];
        if (!p) throw new Error(`A product in your cart is no longer available.`);
        const qty   = Math.max(1, Number(i.quantity) || 1);
        const price = priceInCurrency(p, currency, usdRate);
        return {
            product_id: p.id,
            name:       p.name,
            image:      typeof p.image === 'string' ? p.image : null,
            size:       i.size || null,
            quantity:   qty,
            price,                       // unit price in the chosen currency
            line_total: Math.round(price * qty * 100) / 100,
        };
    });

    const total = lineItems.reduce((s, li) => s + li.line_total, 0);
    return { lineItems, total: Math.round(total * 100) / 100 };
}
