import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'プライバシーポリシー | Garoop Novel',
        description: 'Garoop Novelのプライバシーポリシー。個人情報の取り扱い、Cookie、広告配信について説明します。',
        lang,
        path: '/privacy',
    });
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-slate-900/70 p-8 rounded-lg shadow-md border border-slate-800">
                <h1 className="text-3xl font-bold mb-8 text-slate-100 border-b border-slate-700 pb-4">プライバシーポリシー</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-100">1. 個人情報の利用目的</h2>
                    <p className="mb-4">
                        当ブログでは、お問い合わせや記事へのコメントの際、名前やメールアドレス等の個人情報を入力いただく場合がございます。<br />
                        取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-100">2. 広告について</h2>
                    <p className="mb-4">
                        当ブログでは、第三者配信の広告サービス（Googleアドセンス、A8.net）を利用しており、ユーザーの興味に応じた商品やサービスの広告を表示するため、クッキー（Cookie）を使用しております。<br />
                        クッキーを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。
                    </p>
                    <p className="mb-4">
                        Cookieを無効にする方法やGoogleアドセンスに関する詳細は<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">「広告 – ポリシーと規約 – Google」</a>をご確認ください。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-100">3. アクセス解析ツールについて</h2>
                    <p className="mb-4">
                        当ブログでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにクッキー（Cookie）を使用しております。トラフィックデータは匿名で収集されており、個人を特定するものではありません。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-100">4. 免責事項</h2>
                    <p className="mb-4">
                        当ブログからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br />
                        また当ブログのコンテンツ・情報について、できる限り正確な情報を掲載するよう努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。<br />
                        当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                    </p>
                </section>
            </div>
        </div>
    );
}
