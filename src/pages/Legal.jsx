import PageMeta from '@/components/shared/PageMeta';

/**
 * Privacy Policy + Terms of Service. One component, two routes
 * (<Legal doc="privacy" /> and <Legal doc="terms" />).
 *
 * ⚠️  TEMPLATE — fill the [BRACKETED] placeholders with SOIL's real details and
 * have a lawyer review before launch. The data-handling facts below match how
 * the site actually works (Paystack, Supabase, Resend, Vercel, Spotify embed).
 */

const COMPANY      = '[SOIL legal entity name]';
const CONTACT      = '[privacy/legal contact email]';
const JURISDICTION = '[country / state of governing law]';
const UPDATED      = '[effective date]';

const H1 = (p) => <h1 className="font-display text-3xl md:text-4xl text-foreground/90 tracking-tight mb-2" {...p} />;
const H2 = (p) => <h2 className="font-display text-lg md:text-xl text-accent/90 tracking-wide mt-10 mb-3" {...p} />;
const P  = (p) => <p className="font-ui text-[15px] text-foreground/65 leading-relaxed mb-3" {...p} />;
const LI = (p) => <li className="font-ui text-[15px] text-foreground/65 leading-relaxed mb-1.5" {...p} />;

function Privacy() {
    return (
        <>
            <H1>Privacy Policy</H1>
            <P><span className="text-foreground/40">Last updated: {UPDATED}</span></P>
            <P>{COMPANY} (“SOIL”, “we”) operates this website. This policy explains what we collect, why, and your choices.</P>

            <H2>What we collect</H2>
            <ul className="list-disc pl-5">
                <LI><strong className="text-foreground/80">Orders:</strong> your name, email, shipping address and order details when you buy something.</LI>
                <LI><strong className="text-foreground/80">Payments:</strong> card payments are handled entirely by <strong>Paystack</strong> — we never see or store your card details.</LI>
                <LI><strong className="text-foreground/80">Newsletter:</strong> your email address, if you choose to subscribe.</LI>
                <LI><strong className="text-foreground/80">Contact form:</strong> your name, email and message.</LI>
                <LI><strong className="text-foreground/80">Cookies:</strong> see the section below.</LI>
            </ul>

            <H2>How we use it</H2>
            <ul className="list-disc pl-5">
                <LI>To process, fulfil and ship your orders, and send order confirmations.</LI>
                <LI>To reply to enquiries you send us.</LI>
                <LI>To send the newsletter — only if you opted in (unsubscribe anytime).</LI>
            </ul>

            <H2>Who processes your data</H2>
            <P>We use trusted providers strictly to run the site:</P>
            <ul className="list-disc pl-5">
                <LI><strong className="text-foreground/80">Paystack</strong> — payment processing.</LI>
                <LI><strong className="text-foreground/80">Supabase</strong> — secure database storing orders, messages and subscribers.</LI>
                <LI><strong className="text-foreground/80">Resend</strong> — sending order/confirmation emails.</LI>
                <LI><strong className="text-foreground/80">Vercel</strong> — website hosting.</LI>
                <LI><strong className="text-foreground/80">Spotify</strong> — the embedded music player loads from Spotify and may set its own cookies.</LI>
            </ul>

            <H2>Cookies</H2>
            <P>The site itself uses only what's needed to function (e.g. remembering your cookie choice and admin sessions). The embedded Spotify player is a third party that may set its own cookies when it loads. You can accept or decline via the banner, and manage cookies in your browser at any time.</P>

            <H2>Your rights</H2>
            <P>You can ask us to access, correct or delete your personal data, and unsubscribe from the newsletter at any time. Contact us at <span className="text-accent/80">{CONTACT}</span>. Depending on where you live (e.g. the EU/UK under GDPR), you may have additional rights.</P>

            <H2>Retention &amp; security</H2>
            <P>We keep order data as long as needed for the order and our legal/accounting obligations, and other data until you ask us to remove it. Data is protected with row-level security and access controls.</P>

            <H2>Changes &amp; contact</H2>
            <P>We may update this policy; the “last updated” date will change. Questions: <span className="text-accent/80">{CONTACT}</span>.</P>
        </>
    );
}

function Terms() {
    return (
        <>
            <H1>Terms of Service</H1>
            <P><span className="text-foreground/40">Last updated: {UPDATED}</span></P>
            <P>By using this website and shop, you agree to these terms. The site is operated by {COMPANY}.</P>

            <H2>The shop</H2>
            <ul className="list-disc pl-5">
                <LI>Product descriptions, pricing and availability may change at any time.</LI>
                <LI>Orders are an offer to buy; we may accept or decline (e.g. if an item is out of stock).</LI>
                <LI>Payment is processed securely by Paystack. Prices are shown in your selected currency (Naira or US Dollars).</LI>
            </ul>

            <H2>Shipping &amp; returns</H2>
            <P>[Add SOIL's shipping timelines, regions served, and returns/refunds policy here.]</P>

            <H2>Intellectual property</H2>
            <P>All content on this site — text, imagery, branding and design — belongs to {COMPANY} unless stated otherwise, and may not be reused without permission.</P>

            <H2>Acceptable use</H2>
            <P>Don't misuse the site, attempt to disrupt it, or use it for anything unlawful.</P>

            <H2>Disclaimers &amp; liability</H2>
            <P>The site is provided “as is”. To the fullest extent permitted by law, {COMPANY} is not liable for indirect or consequential losses arising from use of the site.</P>

            <H2>Governing law</H2>
            <P>These terms are governed by the laws of {JURISDICTION}.</P>

            <H2>Contact</H2>
            <P>Questions about these terms: <span className="text-accent/80">{CONTACT}</span>.</P>
        </>
    );
}

export default function Legal({ doc = 'privacy' }) {
    const isPrivacy = doc === 'privacy';
    return (
        <main className="min-h-screen bg-background px-6 pt-32 pb-28">
            <PageMeta
                title={`${isPrivacy ? 'Privacy Policy' : 'Terms of Service'} — SOIL`}
                description={isPrivacy ? 'How SOIL collects and handles your data.' : 'Terms of using the SOIL website and shop.'}
                canonicalPath={isPrivacy ? '/privacy' : '/terms'}
            />
            <article className="max-w-2xl mx-auto">
                {isPrivacy ? <Privacy /> : <Terms />}
            </article>
        </main>
    );
}
