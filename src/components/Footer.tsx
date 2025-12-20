import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-2xl">🎡</span>
                            <Link href="/" className="text-2xl font-black tracking-wider hover:text-yellow-200 transition-colors">
                                GARUCHAN LAND
                            </Link>
                        </div>
                        <p className="text-sm font-medium opacity-90">AIと笑いで遊ぶ、夢のテーマパーク。</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                        <Link href="/about" className="hover:text-yellow-200 transition-colors">
                            運営者情報
                        </Link>
                        <Link href="/privacy" className="hover:text-yellow-200 transition-colors">
                            プライバシーポリシー
                        </Link>
                        <Link href="/terms" className="hover:text-yellow-200 transition-colors">
                            利用規約
                        </Link>
                        <Link href="/contact" className="hover:text-yellow-200 transition-colors">
                            お問い合わせ
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm font-medium opacity-80">
                    &copy; {new Date().getFullYear()} Garuchan Land. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
