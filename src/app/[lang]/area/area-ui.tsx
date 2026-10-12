import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';
import { toJsonLd } from '@/lib/area/content';

/** 地域ページは日本語だけなので、hreflang を付けず canonical だけにする */
const OG_IMAGE = 'https://data.garoop.jp/garoop-asset/resized/1200x630/garoop-novel-1200x630.png';

export function areaMetadata({ title, description, url }: { title: string; description: string; url: string }): Metadata {
    return {
        title,
        description,
        metadataBase: new URL(SITE_URL),
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'Garoop Novel',
            locale: 'ja_JP',
            type: 'website',
            images: [{ url: OG_IMAGE, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [OG_IMAGE],
        },
    };
}

export function JsonLd({ data }: { data: unknown }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(data) }} />;
}

export function TopCta({ label = '📖 Garoop Novel のトップへ' }: { label?: string }) {
    return (
        <div className="flex justify-center">
            <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 sm:px-9 py-4 rounded-[6px] bg-amber-300 text-stone-900 font-serif font-bold tracking-wider shadow-[0_18px_40px_-12px_rgba(217,164,97,0.55)] hover:bg-amber-200 transition-all text-center"
            >
                {label}
            </Link>
        </div>
    );
}

export const panelStyle = {
    background: 'linear-gradient(180deg, rgba(245,228,191,0.04) 0%, rgba(245,228,191,0.01) 100%)',
    boxShadow:
        'inset 0 0 0 1px rgba(217,180,120,0.18), inset 0 0 0 6px rgba(217,180,120,0.05), inset 0 0 0 7px rgba(217,180,120,0.12)',
};

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
    return (
        <nav aria-label="パンくずリスト" className="text-xs sm:text-sm font-serif text-amber-200/70">
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, i) => (
                    <li key={item.name} className="flex items-center gap-1">
                        {i > 0 && <span aria-hidden className="text-amber-200/40">＞</span>}
                        {item.href ? (
                            <Link href={item.href} className="hover:text-amber-100 underline-offset-4 hover:underline">
                                {item.name}
                            </Link>
                        ) : (
                            <span aria-current="page" className="text-amber-50/90">{item.name}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export function AreaBackdrop() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden" aria-hidden>
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(1000px 600px at 20% 15%, rgba(217,164,97,0.18), transparent 70%), radial-gradient(800px 500px at 85% 85%, rgba(120,40,40,0.18), transparent 70%), linear-gradient(160deg, #0a0807 0%, #100b0a 50%, #0a0807 100%)',
                }}
            />
        </div>
    );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="font-serif text-2xl sm:text-3xl text-amber-50 border-b border-amber-200/15 pb-3 mb-6">
            {children}
        </h2>
    );
}

/** 見出し＋本文のカード（特徴・使い方の例） */
export function CardList({ items, grid = false }: { items: { title: string; body: string }[]; grid?: boolean }) {
    return (
        <ul className={grid ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-5'}>
            {items.map((f) => (
                <li key={f.title} className="rounded-[8px] p-6" style={panelStyle}>
                    <h3 className="font-serif text-lg text-amber-100 mb-2">{f.title}</h3>
                    <p className="font-serif text-sm leading-loose text-amber-50/75">{f.body}</p>
                </li>
            ))}
        </ul>
    );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
    return (
        <dl className="space-y-4">
            {items.map((f) => (
                <div key={f.q} className="rounded-[8px] p-6" style={panelStyle}>
                    <dt className="font-serif text-base sm:text-lg text-amber-100 flex gap-3">
                        <span className="shrink-0 text-amber-300 font-black">Q</span>
                        <span>{f.q}</span>
                    </dt>
                    <dd className="mt-3 font-serif text-sm leading-loose text-amber-50/80 flex gap-3">
                        <span className="shrink-0 text-amber-200/60 font-black">A</span>
                        <span>{f.a}</span>
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/** 地域リンクのチップ列 */
export function LinkChips({ title, links }: { title?: string; links: { href: string; name: string }[] }) {
    if (links.length === 0) return null;
    return (
        <div className="mb-6">
            {title && <h3 className="font-serif text-sm text-amber-200/80 mb-3">{title}</h3>}
            <ul className="flex flex-wrap gap-2 sm:gap-3">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link
                            href={l.href}
                            className="inline-block rounded-full border border-amber-200/25 px-4 py-2 font-serif text-sm text-amber-50/90 hover:bg-amber-300/10 hover:text-amber-100 transition-colors"
                        >
                            {l.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** ページ末尾の CTA */
export function BottomCta({ text }: { text: string }) {
    return (
        <section className="mt-16 rounded-[10px] px-5 sm:px-10 py-10 text-center" style={panelStyle}>
            <p className="font-serif text-base sm:text-lg leading-loose text-amber-50/85 mb-6">{text}</p>
            <TopCta />
        </section>
    );
}

/** ヒーロー（ラベル・H1・リード・CTA） */
export function AreaHero({ label, title, sub, lead }: { label: string; title: string; sub: string; lead: string }) {
    return (
        <header className="mt-8 rounded-[10px] px-5 sm:px-10 py-10 sm:py-14 text-center" style={panelStyle}>
            <p className="font-serif tracking-[0.3em] text-amber-200/70 text-[11px] sm:text-xs">{label}</p>
            <h1 className="mt-4 font-serif font-black text-2xl sm:text-4xl md:text-5xl leading-snug tracking-[0.02em] text-amber-50">
                {title}
                <span className="block mt-2 text-lg sm:text-2xl text-amber-200/90">{sub}</span>
            </h1>
            <p className="mt-6 font-serif text-sm sm:text-base leading-loose text-amber-50/85 max-w-2xl mx-auto text-left sm:text-center">
                {lead}
            </p>
            <div className="mt-8">
                <TopCta />
            </div>
        </header>
    );
}
