import { describe, it, expect } from 'vitest';
import { convertPrice, convertAmount, formatPrice } from '../src/lib/currency.js';
import { priceInCurrency, toSubunit, buildOrder } from '../api/_lib/paystack.js';

describe('currency formatting', () => {
    it('formats Naira with no decimals', () => {
        expect(formatPrice(152000, 'NGN')).toBe('₦152,000');
    });
    it('formats whole USD without decimals', () => {
        expect(formatPrice(95, 'USD')).toBe('$95');
    });
    it('formats fractional USD with 2 decimals', () => {
        expect(formatPrice(99.5, 'USD')).toBe('$99.50');
    });
});

describe('frontend price conversion', () => {
    it('returns the Naira price unchanged for NGN', () => {
        expect(convertPrice({ price: 160000 }, 'NGN', 1600)).toBe(160000);
    });
    it('derives USD from the Naira price + rate', () => {
        expect(convertPrice({ price: 160000 }, 'USD', 1600)).toBe(100);
    });
    it('uses an explicit USD override when present', () => {
        expect(convertPrice({ price: 160000, priceUsd: 120 }, 'USD', 1600)).toBe(120);
    });
    it('converts a base amount to USD', () => {
        expect(convertAmount(160000, 'USD', 1600)).toBe(100);
    });
});

describe('server-side pricing (paystack)', () => {
    it('prices in Naira from the DB row', () => {
        expect(priceInCurrency({ price: 160000 }, 'NGN', 1600)).toBe(160000);
    });
    it('derives USD from rate when no price_usd', () => {
        expect(priceInCurrency({ price: 160000 }, 'USD', 1600)).toBe(100);
    });
    it('honours an explicit price_usd override', () => {
        expect(priceInCurrency({ price: 160000, price_usd: 120 }, 'USD', 1600)).toBe(120);
    });
    it('converts major units to subunits', () => {
        expect(toSubunit(100)).toBe(10000);
    });
});

describe('buildOrder — trusted server-side cart pricing', () => {
    // Minimal Supabase stand-in returning two products
    const supa = {
        from() {
            return {
                select() {
                    return {
                        in: async () => ({
                            data: [
                                { id: 'a', name: 'Jacket', price: 160000, price_usd: null, image: 'x' },
                                { id: 'b', name: 'Hoodie', price: 80000, price_usd: 60, image: null },
                            ],
                            error: null,
                        }),
                    };
                },
            };
        },
    };

    it('totals a Naira cart from DB prices, ignoring client-supplied prices', async () => {
        const { lineItems, total } = await buildOrder({
            supa,
            items: [{ id: 'a', size: 'M', quantity: 2 }, { id: 'b', quantity: 1 }],
            currency: 'NGN',
            usdRate: 1600,
        });
        expect(total).toBe(160000 * 2 + 80000);
        expect(lineItems[0].line_total).toBe(320000);
    });

    it('totals a USD cart using rate + explicit override', async () => {
        const { total } = await buildOrder({
            supa,
            items: [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 1 }],
            currency: 'USD',
            usdRate: 1600,
        });
        // a: 160000/1600 = 100, b: explicit 60 → 160
        expect(total).toBe(160);
    });

    it('rejects an item that no longer exists', async () => {
        await expect(buildOrder({
            supa, items: [{ id: 'ghost', quantity: 1 }], currency: 'NGN', usdRate: 1600,
        })).rejects.toThrow();
    });
});
