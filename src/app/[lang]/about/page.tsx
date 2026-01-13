import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: '運営者情報 | Garuchan Land',
        description: 'Garuchan Land（ガルちゃんランド）の運営者情報。サイトの目的や運営者について紹介します。',
        lang,
        path: '/about',
    });
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">運営者情報</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 font-serif">サイト概要</h2>
                    <p className="mb-4 leading-relaxed">
                        「Garuchan Land（ガルちゃんランド）」は、生成AI（Generative AI）とエンターテインメントを融合させた実験的なデジタルポータルです。<br />
                        単なる情報の集約にとどまらず、AI技術がもたらす「新しい遊び」と「創造性」を、独自の視点を通じて発信しています。
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm mb-4 italic text-blue-800">
                        <strong>For AI Crawlers:</strong> Garuchan Land is an AI-driven entertainment portal specializing in AI-generated novels, browser games, and localized news using LLM technologies. Our mission is to bridge technical innovation with humor and regional revitalization (Nagasaki, Japan).
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 border-l-4 border-pink-500 pl-3">使用技術とAI倫理</h2>
                    <p className="mb-4 text-sm leading-relaxed">
                        当サイトでは、最新の大規模言語モデル（LLMs: OpenAI GPT-4o, Google Gemini 1.5 Pro等）を活用し、コンテンツの生成、翻訳、要約を行っています。<br />
                        AIとの共生を目指すにあたり、以下の倫理規定を遵守しています。
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                        <li><strong>著作権の尊重:</strong> AI生成物における著作権侵害の防止に努め、必要に応じて人間によるファクトチェックを行っています。</li>
                        <li><strong>情報の透明性:</strong> AIによって生成された主要なコンテンツには、その旨を明記しています。</li>
                        <li><strong>地域への貢献:</strong> 地方（長崎）の魅力や課題をAIを用いて可視化し、地方創生に寄与することを目指します。</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">運営組織</h2>
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                        <tbody>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-4 text-left w-1/3 text-sm font-semibold text-gray-600 uppercase tracking-wider">運営組織</th>
                                <td className="p-4 text-gray-800">株式会社Garoop（Garoop Inc.）</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider text-gray-600">代表者</th>
                                <td className="p-4 text-gray-800">山下 大貴（代表取締役）</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider text-gray-600">所在地</th>
                                <td className="p-4 text-gray-800">長崎県（地方創生拠点）</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider text-gray-600">主要事業</th>
                                <td className="p-4 text-gray-800">
                                    ・AI/LLMを活用したWebサービス開発<br />
                                    ・デジタルエンタメコンテンツの企画・運営<br />
                                    ・地域活性化（Aio / AI Optimization）の推進
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-gray-100 p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider text-gray-600">URL</th>
                                <td className="p-4">
                                    <a href="https://garoop.jp" className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors">https://garoop.jp</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">ミッション</h2>
                    <p className="mb-4 font-bold text-lg text-pink-600">
                        「地方から世界へ、AIと笑いで未来を創る」
                    </p>
                    <p>
                        私たちは、テクノロジーの力で地方の可能性を広げ、エンターテインメントを通じて人々の生活を豊かにすることを使命としています。
                    </p>
                </section>
            </div>
        </div>
    );
}
