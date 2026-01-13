import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'お問い合わせ | Garoop Novel',
        description: 'Garoop Novelへのお問い合わせはこちらから。',
        lang,
        path: '/contact',
    });
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-slate-900/70 p-8 rounded-lg shadow-md border border-slate-800">
                <h1 className="text-3xl font-bold mb-8 text-slate-100 border-b border-slate-700 pb-4">お問い合わせ</h1>

                <p className="mb-6">
                    当サイトに関するお問い合わせは、以下のメールアドレスまでお願いいたします。
                </p>

                <div className="bg-slate-800/70 border border-slate-700 p-6 rounded-lg mb-8">
                    <h2 className="text-lg font-bold mb-2">メールでのお問い合わせ</h2>
                    <p className="text-xl font-mono text-amber-300">garoop.company@gmail.com</p>
                </div>

                <p className="text-sm text-slate-400">
                    ※お問い合わせ内容によっては、返信にお時間をいただく場合や、お答えできない場合がございます。あらかじめご了承ください。<br />
                    ※営業メールやスパムメールはお断りいたします。
                </p>
            </div>
        </div>
    );
}
