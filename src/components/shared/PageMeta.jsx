import { Helmet } from 'react-helmet-async';

/**
 * PageMeta — set per-page title, description, and OG tags.
 *
 * Honest note on SPAs: social-media crawlers (WhatsApp, Facebook, Discord,
 * Slack, iMessage) DO NOT execute JavaScript. They read what's in the static
 * index.html. So these tags improve:
 *   - Browser tab titles
 *   - Google search results (Google does execute JS, slowly)
 *   - Bookmarks / link previews in tools that run JS
 *
 * For true per-product social previews when someone shares a deep link,
 * we'd need server-side rendering or a Vercel Edge function that serves
 * pre-rendered HTML to crawlers. Out of scope for now.
 *
 * Defaults are inherited from index.html — only fields explicitly passed
 * here are overridden.
 *
 * Props:
 *   - title         — full page title (e.g. "Active Asake — SOIL Studio")
 *   - description   — page-specific description (under 160 chars ideal)
 *   - image         — absolute URL to OG image (1200x630 preferred)
 *   - type          — "website" (default) or "product" / "article"
 *   - noindex       — true to add <meta name="robots" content="noindex">
 *   - canonicalPath — relative path; appended to site origin for the canonical URL
 *   - children      — additional <Helmet> nodes (e.g. JSON-LD)
 */
export default function PageMeta({
    title,
    description,
    image,
    type = 'website',
    noindex = false,
    canonicalPath,
    children,
}) {
    const origin     = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl    = canonicalPath ? `${origin}${canonicalPath}` : (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            {title && <title>{title}</title>}
            {title && <meta property="og:title"  content={title} />}
            {title && <meta name="twitter:title" content={title} />}

            {description && <meta name="description"        content={description} />}
            {description && <meta property="og:description" content={description} />}
            {description && <meta name="twitter:description" content={description} />}

            {image && <meta property="og:image"  content={image} />}
            {image && <meta name="twitter:image" content={image} />}

            <meta property="og:type" content={type} />
            {fullUrl && <meta property="og:url" content={fullUrl} />}
            {fullUrl && <link rel="canonical" href={fullUrl} />}

            {noindex && <meta name="robots" content="noindex, follow" />}

            {children}
        </Helmet>
    );
}
