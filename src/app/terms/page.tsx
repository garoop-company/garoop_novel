import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '利用規約 | Garuchan News',
    description: 'Garuchan News（ガルちゃんニュース）の利用規約。サイトの利用ルールについて説明します。',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">利用規約</h1>

                <p className="mb-4">
                    この利用規約（以下，「本規約」といいます。）は，Garuchan News（以下，「当サイト」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">第1条（適用）</h2>
                    <p className="mb-4">
                        本規約は，ユーザーと当サイトとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">第2条（禁止事項）</h2>
                    <p className="mb-4">ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>法令または公序良俗に違反する行為</li>
                        <li>犯罪行為に関連する行為</li>
                        <li>当サイトのサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
                        <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
                        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                        <li>不正アクセスをし，またはこれを試みる行為</li>
                        <li>他のユーザーに成りすます行為</li>
                        <li>その他，当サイトが不適切と判断する行為</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">第3条（本サービスの提供の停止等）</h2>
                    <p className="mb-4">
                        当サイトは，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                        <li>地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合</li>
                        <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                        <li>その他，当サイトが本サービスの提供が困難と判断した場合</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">第4条（免責事項）</h2>
                    <p className="mb-4">
                        当サイトの債務不履行責任は，当サイトの故意または重過失によらない場合には免責されるものとします。<br />
                        当サイトは，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。
                    </p>
                </section>
            </div>
        </div>
    );
}
