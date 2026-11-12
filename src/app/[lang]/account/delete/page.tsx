import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import { localizePath } from '@/lib/locale-path';
import { ACCOUNT_DELETE } from '@/lib/account-delete';
import DeleteAccountForm from '@/components/DeleteAccountForm';

// 本文は日本語と英語だけ。ほかの言語では英語版を出し、canonical は日本語版に向ける。
const AVAILABLE: readonly Locale[] = ['ja', 'en'];

function resolveLang(rawLang: string): Locale {
    return (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const lang = resolveLang((await params).lang);
    const copy = ACCOUNT_DELETE[lang === 'ja' ? 'ja' : 'en'];

    return generateLocalizedMetadata({
        title: `${copy.title} | Garoop Novel`,
        description: copy.lead,
        lang,
        path: '/account/delete',
        availableLocales: AVAILABLE,
    });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-slate-100">{title}</h2>
            <div className="grid gap-2 leading-relaxed">{children}</div>
        </section>
    );
}

/**
 * アカウント削除。Google Play Console の「アカウント削除の URL」に登録するページ。
 * アプリを入れていない人が開いても読めるよう、案内はログインなしで出す。削除の実行はログイン中だけ。
 */
export default async function AccountDeletePage({ params }: { params: Promise<{ lang: string }> }) {
    const lang = resolveLang((await params).lang);
    const copyLang = lang === 'ja' ? 'ja' : 'en';
    const copy = ACCOUNT_DELETE[copyLang];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-slate-900/70 p-8 rounded-lg shadow-md border border-slate-800" lang={copyLang}>
                <h1 className="text-3xl font-bold mb-8 text-slate-100 border-b border-slate-700 pb-4">{copy.title}</h1>

                {copyLang !== lang && (
                    <p className="mb-4 rounded-md border border-amber-700/40 bg-amber-950/40 p-3 text-xs text-amber-200">
                        This page is available in Japanese and English only.
                    </p>
                )}

                <p className="mb-6 leading-relaxed">{copy.lead}</p>

                <div className="mb-8 rounded-md border border-amber-600/40 bg-amber-950/30 p-4">
                    <p className="font-bold text-amber-200">{copy.sharedTitle}</p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-100/90">{copy.shared}</p>
                </div>

                <Section title={copy.stepsTitle}>
                    {copy.steps.map((s) => (
                        <p key={s}>{s}</p>
                    ))}
                </Section>
                <Section title={copy.erasedTitle}>
                    {copy.erased.map((s) => (
                        <p key={s}>{s}</p>
                    ))}
                </Section>
                <Section title={copy.keptTitle}>
                    {copy.kept.map((s) => (
                        <p key={s}>{s}</p>
                    ))}
                    <p className="text-sm text-slate-400">{copy.keptNote}</p>
                </Section>
                <Section title={copy.timingTitle}>
                    <p>{copy.timing}</p>
                </Section>
                <Section title={copy.contactTitle}>
                    <p>{copy.contact}</p>
                </Section>
            </div>

            <div className="max-w-3xl mx-auto mt-8" lang={copyLang}>
                <h2 className="text-xl font-bold mb-4 text-slate-100">{copy.formTitle}</h2>
                <DeleteAccountForm copy={copy} homeHref={localizePath('/', lang)} />
            </div>
        </div>
    );
}
