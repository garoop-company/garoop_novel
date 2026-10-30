import Link from 'next/link';
import { locales, Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import { JA_ONLY, generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import { posts, formatBlogDate } from '@/lib/blog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'ブログ | Garoop Novel',
        description: 'Garoop Novelのブログ。生成AI・物語・小説のニュースから、代表・山下大貴が考えたことを書いています。',
        lang,
        path: '/blog',
        availableLocales: JA_ONLY,
    });
}

export default async function BlogListPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ブログ | Garoop Novel',
        url: `${SITE_URL}/blog`,
        inLanguage: 'ja',
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: posts.map((post, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE_URL}/blog/${post.slug}`,
                name: post.title,
            })),
        },
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-100 text-center mb-4 font-serif tracking-tight">ブログ</h1>
                <p className="text-center text-slate-400 mb-12">生成AI・物語・小説のニュースから、Garoop Novelが考えたことを書いています。</p>

                <div className="space-y-6">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={localizePath(`/blog/${post.slug}`, lang)}
                            className="block bg-slate-900/70 rounded-2xl shadow-sm border border-slate-700 p-6 sm:p-8 transition-all hover:shadow-md"
                        >
                            <time dateTime={post.publishedAt} className="text-xs font-bold tracking-widest text-slate-400">
                                {formatBlogDate(post.publishedAt)}
                            </time>
                            <h2 className="mt-2 text-xl font-bold leading-snug text-slate-100">{post.title}</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-3">{post.description}</p>
                            <p className="mt-4 text-xs text-slate-400">
                                {post.author.name}（{post.author.role}）
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
