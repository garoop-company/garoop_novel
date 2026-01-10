import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '運営者情報 | Garuchan Land',
    description: 'Garuchan Land（ガルちゃんランド）の運営者情報。サイトの目的や運営者について紹介します。',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">運営者情報</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">サイト概要</h2>
                    <p className="mb-4">
                        「Garuchan Land（ガルちゃんランド）」は、AIとユーモアを融合させた新しい形のエンターテインメントメディアです。<br />
                        日々のニュースをただ伝えるだけでなく、AIによる独自の視点や「笑い」の要素を取り入れることで、楽しく学べる情報発信を目指しています。
                    </p>
                    <p className="mb-4">
                        また、子供向けのゲームコンテンツ「<Link href="/game" className="text-blue-600 hover:underline">Garuchan Game</Link>」も提供しており、親子で安心して楽しめるサイト作りを心がけています。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">運営者</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <tbody>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-3 text-left w-1/3">運営組織</th>
                                <td className="p-3">Garoop株式会社</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-3 text-left">代表者</th>
                                <td className="p-3">山下 大貴</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-3 text-left">所在地</th>
                                <td className="p-3">長崎県</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <th className="bg-gray-100 p-3 text-left">事業内容</th>
                                <td className="p-3">
                                    ・Webメディア運営<br />
                                    ・AI技術の活用・研究<br />
                                    ・地方創生事業
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-gray-100 p-3 text-left">URL</th>
                                <td className="p-3"><a href="https://garoop.jp" className="text-blue-600 hover:underline">https://garoop.jp</a></td>
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
