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
        <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">お問い合わせ</h1>

                <p className="mb-6">
                    当サイトに関するお問い合わせは、以下のメールアドレスまでお願いいたします。
                </p>

                <div className="bg-gray-100 p-6 rounded-lg mb-8">
                    <h2 className="text-lg font-bold mb-2">メールでのお問い合わせ</h2>
                    <p className="text-xl font-mono text-blue-600">garoop.company@gmail.com</p>
                </div>

                <p className="text-sm text-gray-600">
                    ※お問い合わせ内容によっては、返信にお時間をいただく場合や、お答えできない場合がございます。あらかじめご了承ください。<br />
                    ※営業メールやスパムメールはお断りいたします。
                </p>
            </div>
        </div>
    );
}
