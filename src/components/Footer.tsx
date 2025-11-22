import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Link href="/" className="text-xl font-bold text-white hover:text-pink-500 transition-colors">
                            Garuchan News
                        </Link>
                        <p className="text-sm mt-2">AIと笑いで読む、時代のニュースメディア。</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="/about" className="hover:text-white transition-colors">
                            運営者情報
                        </Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">
                            プライバシーポリシー
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            利用規約
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors">
                            お問い合わせ
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Garoop. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
