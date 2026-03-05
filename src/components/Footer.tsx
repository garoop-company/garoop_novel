import Link from 'next/link';
import { getDictionary, Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';

interface FooterProps {
    lang?: Locale;
}

export default function Footer({ lang = 'ja' }: FooterProps) {
    const dict = getDictionary(lang);
    const pg = (path: string) => localizePath(path, lang);
    return (
        <footer className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 backdrop-blur-sm p-8 rounded-3xl border border-slate-800">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-2xl">🕯️</span>
                            <Link href={pg('/')} className="text-2xl font-black tracking-wider hover:text-amber-200 transition-colors">
                                {dict.hero.title}
                            </Link>
                        </div>
                        <p className="text-sm font-medium opacity-90">{dict.hero.subtitle}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                        <Link href={pg('/about')} className="hover:text-amber-200 transition-colors">
                            {dict.common.about}
                        </Link>
                        <Link href={pg('/faq')} className="hover:text-amber-200 transition-colors">
                            {dict.common.faq}
                        </Link>
                        <Link href={pg('/privacy')} className="hover:text-amber-200 transition-colors">
                            {dict.common.privacy}
                        </Link>
                        <Link href={pg('/terms')} className="hover:text-amber-200 transition-colors">
                            {dict.common.terms}
                        </Link>
                        <Link href={pg('/contact')} className="hover:text-amber-200 transition-colors">
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
