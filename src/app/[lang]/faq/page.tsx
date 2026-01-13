import { locales, Locale, getDictionary } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'よくある質問 | Garoop Novel',
        description: 'Garoop Novelに関するよくある質問にお答えします。AI小説や運営について。',
        lang,
        path: '/faq',
    });
}

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    const dict = getDictionary(lang);
    const faqData = dict.faq;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.items.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Script
                id="faq-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-100 text-center mb-12 font-serif tracking-tight">
                    {faqData.title}
                </h1>
                <p className="text-center text-slate-400 mb-12">
                    {faqData.description}
                </p>

                <div className="space-y-8">
                    {faqData.items.map((item, index) => (
                        <div key={index} className="bg-slate-900/70 rounded-2xl shadow-sm border border-slate-800 p-8 transform transition-all hover:shadow-md">
                            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-start">
                                <span className="bg-amber-500/15 text-amber-300 w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-black">Q</span>
                                {item.q}
                            </h2>
                            <div className="text-slate-300 leading-relaxed flex items-start pl-12 border-l-2 border-slate-800">
                                <span className="sr-only">Answer:</span>
                                {item.a}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-slate-900/70 rounded-2xl p-8 border border-slate-800 text-center">
                    <h3 className="text-xl font-bold text-amber-200 mb-4">他に質問がありますか？</h3>
                    <p className="text-slate-300 mb-6 font-medium">お気軽にお問い合わせください。</p>
                    <a href={`/${lang}/contact`} className="inline-block bg-amber-500 text-slate-950 px-8 py-3 rounded-full font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/30">
                        お問い合わせはこちら
                    </a>
                </div>
            </div>
        </div>
    );
}
