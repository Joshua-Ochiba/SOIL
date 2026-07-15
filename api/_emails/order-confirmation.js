/* ─────────────────────────────────────────────────────────────────────────────
   SOIL Studio — Order confirmation email
   Plain HTML — renders cleanly in Gmail, Apple Mail, Outlook, mobile clients.

   Two templates exported:
     - customerOrderEmail(order)  → sent to the buyer
     - adminOrderNotification(order) → sent to Duke / hello@

   Both take a normalized `order` object:
     { id, items, total, customer_name, customer_email, shipping_address }
───────────────────────────────────────────────────────────────────────────── */

const BG          = '#0a0806';
const SURFACE     = '#13100c';
const BORDER      = 'rgba(255,255,255,0.08)';
const TEXT        = '#fff6dc';
const MUTED       = 'rgba(255,246,220,0.55)';
const SUN         = '#d9a036';

const fmt = (n) => {
    const num = Number(n) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Currency symbol for the order. Defaults to Naira (the store's base currency).
const symbolFor = (currency) => (String(currency).toUpperCase() === 'USD' ? '$' : '₦');

const escape = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderAddress = (addr) => {
    if (!addr) return '';
    const parts = [
        addr.line1,
        addr.line2,
        [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
        addr.country,
    ].filter(Boolean);
    return parts.map(escape).join('<br>');
};

const renderItemRows = (items = [], sym = '₦') => items.map(item => `
    <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid ${BORDER}; vertical-align: top;">
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: ${TEXT}; font-weight: 500; letter-spacing: 0.02em;">
                ${escape(item.name)}
            </div>
            ${item.size ? `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 4px;">
                    Size · ${escape(item.size)}
                </div>
            ` : ''}
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: ${MUTED}; margin-top: 4px;">
                Qty ${item.quantity}
            </div>
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid ${BORDER}; vertical-align: top; text-align: right;">
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: ${TEXT}; font-weight: 500;">
                ${sym}${fmt(Number(item.price) * Number(item.quantity))}
            </div>
        </td>
    </tr>
`).join('');

// ── Customer order confirmation ──────────────────────────────────────────────
export function customerOrderEmail(order) {
    const {
        id,
        items = [],
        total = 0,
        currency = 'NGN',
        customer_name,
        shipping_address,
    } = order;

    const sym       = symbolFor(currency);
    const cur       = String(currency).toUpperCase();
    const firstName = (customer_name || '').split(' ')[0] || 'Friend';
    const orderRef  = String(id).replace(/^(wh_|ps_)/, '').slice(-12).toUpperCase();

    const subject = `Order received — SOIL Studio (#${orderRef})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${BG}; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${BG};">
        <tr>
            <td align="center" style="padding: 48px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background: ${SURFACE}; border: 1px solid ${BORDER};">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 32px 40px; text-align: center; border-bottom: 1px solid ${BORDER};">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 900; color: ${TEXT}; letter-spacing: 0.25em; text-shadow: 2px 2px 0px rgba(217,160,54,0.4);">
                                SOIL
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9px; color: ${MUTED}; letter-spacing: 0.5em; text-transform: uppercase; margin-top: 6px;">
                                Studio
                            </div>
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td style="padding: 40px 40px 24px 40px;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${SUN}; letter-spacing: 0.4em; text-transform: uppercase; font-weight: 600; margin-bottom: 12px;">
                                Order received
                            </div>
                            <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; color: ${TEXT}; line-height: 1.3; letter-spacing: -0.01em;">
                                ${escape(firstName)}, your order is in motion.
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: ${MUTED}; line-height: 1.6; margin-top: 16px;">
                                We've received your order and will be preparing it for shipment. You'll get another note from us once it's on its way.
                            </div>
                        </td>
                    </tr>

                    <!-- Order reference -->
                    <tr>
                        <td style="padding: 0 40px 24px 40px;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase;">
                                Order reference
                            </div>
                            <div style="font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 13px; color: ${TEXT}; margin-top: 6px; letter-spacing: 0.1em;">
                                #${orderRef}
                            </div>
                        </td>
                    </tr>

                    <!-- Items -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid ${BORDER};">
                                Items
                            </div>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                ${renderItemRows(items, sym)}
                            </table>
                        </td>
                    </tr>

                    <!-- Total -->
                    <tr>
                        <td style="padding: 24px 40px 32px 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase;">
                                        Total paid
                                    </td>
                                    <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 18px; color: ${SUN}; font-weight: 600; text-align: right;">
                                        ${sym}${fmt(total)} ${cur}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    ${shipping_address ? `
                    <!-- Shipping -->
                    <tr>
                        <td style="padding: 24px 40px 32px 40px; border-top: 1px solid ${BORDER};">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px;">
                                Shipping to
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: ${TEXT}; line-height: 1.7;">
                                ${customer_name ? `<strong style="font-weight: 500;">${escape(customer_name)}</strong><br>` : ''}
                                ${renderAddress(shipping_address)}
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Footer note -->
                    <tr>
                        <td style="padding: 32px 40px 40px 40px; border-top: 1px solid ${BORDER}; text-align: center;">
                            <div style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 13px; color: ${MUTED}; line-height: 1.6;">
                                A culture, not a category.
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 24px;">
                                Questions? Reply to this email.
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Brand footer below card -->
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9px; color: rgba(255,246,220,0.25); letter-spacing: 0.4em; text-transform: uppercase; margin-top: 32px;">
                    SOIL · The first ethno-luxe house
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = [
        `Order received — SOIL Studio`,
        ``,
        `${firstName}, your order is in motion.`,
        ``,
        `Order reference: #${orderRef}`,
        ``,
        `Items:`,
        ...items.map(i => `  • ${i.name}${i.size ? ` (Size: ${i.size})` : ''} × ${i.quantity} — ${sym}${fmt(Number(i.price) * Number(i.quantity))}`),
        ``,
        `Total: ${sym}${fmt(total)} ${cur}`,
        ``,
        shipping_address ? `Shipping to: ${customer_name || ''}\n${[shipping_address.line1, shipping_address.line2, [shipping_address.city, shipping_address.state, shipping_address.postal_code].filter(Boolean).join(', '), shipping_address.country].filter(Boolean).join('\n')}` : '',
        ``,
        `A culture, not a category.`,
        `SOIL Studio`,
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}

// ── Admin / Duke notification ────────────────────────────────────────────────
export function adminOrderNotification(order) {
    const {
        id,
        items = [],
        total = 0,
        currency = 'NGN',
        customer_name,
        customer_email,
        shipping_address,
    } = order;

    const sym      = symbolFor(currency);
    const orderRef = String(id).replace(/^(wh_|ps_)/, '').slice(-12).toUpperCase();
    const subject  = `New order #${orderRef} — ${sym}${fmt(total)} (${customer_name || customer_email || 'Customer'})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${BG}; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="padding: 48px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background: ${SURFACE}; border: 1px solid ${BORDER};">

                    <tr>
                        <td style="padding: 32px 40px 16px 40px; border-bottom: 1px solid ${BORDER};">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${SUN}; letter-spacing: 0.4em; text-transform: uppercase; font-weight: 600;">
                                New order
                            </div>
                            <div style="font-family: Georgia, serif; font-size: 22px; color: ${TEXT}; margin-top: 8px;">
                                #${orderRef} · ${sym}${fmt(total)}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 24px 40px;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 8px;">
                                Customer
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: ${TEXT}; line-height: 1.6;">
                                ${escape(customer_name || '—')}<br>
                                <a href="mailto:${escape(customer_email || '')}" style="color: ${SUN}; text-decoration: none;">${escape(customer_email || '—')}</a>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 24px 40px;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px;">
                                Items
                            </div>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                ${renderItemRows(items, sym)}
                            </table>
                        </td>
                    </tr>

                    ${shipping_address ? `
                    <tr>
                        <td style="padding: 24px 40px 32px 40px; border-top: 1px solid ${BORDER};">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px;">
                                Ship to
                            </div>
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: ${TEXT}; line-height: 1.7;">
                                ${renderAddress(shipping_address)}
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <tr>
                        <td style="padding: 24px 40px 32px 40px; border-top: 1px solid ${BORDER}; text-align: center;">
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${MUTED}; letter-spacing: 0.3em; text-transform: uppercase;">
                                Manage in admin → Orders
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = [
        `NEW ORDER #${orderRef} — ${sym}${fmt(total)}`,
        ``,
        `Customer: ${customer_name || '—'} <${customer_email || '—'}>`,
        ``,
        `Items:`,
        ...items.map(i => `  • ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.quantity}`),
        ``,
        shipping_address ? `Ship to:\n${[shipping_address.line1, shipping_address.line2, [shipping_address.city, shipping_address.state, shipping_address.postal_code].filter(Boolean).join(', '), shipping_address.country].filter(Boolean).join('\n')}` : '',
    ].filter(Boolean).join('\n');

    return { subject, html, text };
}
