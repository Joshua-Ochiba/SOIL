import useCurrencyStore from '@/store/currencyStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
    convertPrice, convertAmount, formatPrice, CURRENCY_SYMBOL, DEFAULT_USD_RATE,
} from '@/lib/currency';

/**
 * One hook for everything price-related in the store. Combines the shopper's
 * chosen currency with the exchange rate from Settings, and returns ready-made
 * formatters so components never touch conversion logic directly.
 */
export function usePrice() {
    const currency    = useCurrencyStore(s => s.currency);
    const setCurrency = useCurrencyStore(s => s.setCurrency);
    const { data: settings } = useSiteSettings();

    const usdRate    = settings?.usd_rate ?? DEFAULT_USD_RATE;
    // USD checkout is on unless the admin explicitly turned it off.
    const usdEnabled = settings?.usd_checkout_enabled !== false;

    // If USD got disabled while a shopper had it selected, fall back to NGN.
    const active = (currency === 'USD' && !usdEnabled) ? 'NGN' : currency;

    return {
        currency: active,
        setCurrency,
        usdEnabled,
        usdRate,
        symbol: CURRENCY_SYMBOL[active],
        /** Formatted price string for a product (e.g. "₦152,000" / "$95"). */
        format: (product) => formatPrice(convertPrice(product, active, usdRate), active),
        /** Numeric price for a product in the active currency. */
        value: (product) => convertPrice(product, active, usdRate),
        /** Format a base-currency (NGN) amount in the active currency. */
        formatAmount: (ngnAmount) => formatPrice(convertAmount(ngnAmount, active, usdRate), active),
        /** Numeric: convert a base-currency (NGN) amount to the active currency. */
        amount: (ngnAmount) => convertAmount(ngnAmount, active, usdRate),
    };
}
