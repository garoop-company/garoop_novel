import Link from 'next/link';
import { getDictionary, Locale } from '@/locales';

interface FooterProps {
    lang?: Locale;
}

export default function Footer({ lang = 'ja' }: FooterProps) {
    const dict = getDictionary(lang);
    const pg = (path: string) => `/${lang}${path === '/' ? '' : path}`;
    return (
        <footer className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-2xl">🎡</span>
                            <Link href={pg('/')} className="text-2xl font-black tracking-wider hover:text-yellow-200 transition-colors">
                                {dict.hero.title}
                            </Link>
                        </div>
                        <p className="text-sm font-medium opacity-90">{dict.hero.subtitle}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                        <Link href={`/${lang}/about`} className="hover:text-pink-400 transition-colors">
                            {dict.common.about}
                        </Link>
                        <Link href={`/${lang}/faq`} className="hover:text-pink-400 transition-colors">
                            {dict.common.faq}
                        </Link>
                        <Link href={`/${lang}/privacy`} className="hover:text-pink-400 transition-colors">
                            {dict.common.privacy}
                        </Link>
                        <Link href={`/${lang}/terms`} className="hover:text-pink-400 transition-colors">
                            {dict.common.terms}
                        </Link>
                        <Link href={`/${lang}/contact`} className="hover:text-pink-400 transition-colors">
                            {dict.common.contact}
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm font-medium opacity-80">
                    &copy; {new Date().getFullYear()} Garoop Novel. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
