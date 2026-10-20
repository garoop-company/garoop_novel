"use client";

import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale, localeMeta } from '@/locales';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { FaGlobe, FaChevronDown, FaCheck } from 'react-icons/fa';
import { detectLocaleFromPathname, switchLocalePath } from '@/lib/locale-path';

// 言語切替。Garoop の各サイトで同じ形（地球儀＋言語名＋山形 → 一覧から選ぶ）にそろえている。
// 色や角丸はこのサイト（夜の文庫・アンバー系）の見た目に合わせる。
export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
    const baseId = useId();
    const buttonId = `${baseId}-button`;
    const listId = `${baseId}-list`;

    const currentLocale = detectLocaleFromPathname(pathname);
    const currentMeta = localeMeta[currentLocale];
    const currentIndex = Math.max(0, locales.indexOf(currentLocale));

    const close = useCallback((returnFocus: boolean) => {
        setIsOpen(false);
        if (returnFocus) buttonRef.current?.focus();
    }, []);

    const handleLanguageChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) {
            close(true);
            return;
        }

        const newPathname = switchLocalePath(pathname, newLocale);

        setIsOpen(false);
        router.push(newPathname);
    };

    // 開いたら今の言語の行にフォーカスを移し、一覧が見えるところまでスクロールする
    useEffect(() => {
        if (!isOpen) return;
        listRef.current?.scrollIntoView({ block: 'nearest' });
        optionRefs.current[currentIndex]?.focus({ preventScroll: true });
    }, [isOpen, currentIndex]);

    // 外側のクリック・Escape で閉じる。
    // Escape はドロワー（Header）も document で拾って閉じるので、
    // window のキャプチャ段階で止めて、一覧だけを閉じるようにする。
    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            close(true);
        };
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown, true);
        };
    }, [isOpen, close]);

    const onButtonKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
        }
    };

    // 一覧の中は上下キー・Home/End で移動、Enter/Space で決定、Tab で閉じる
    const onListKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
        const focused = optionRefs.current.findIndex((el) => el === document.activeElement);
        const last = locales.length - 1;
        const move = (i: number) => optionRefs.current[i]?.focus();
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                move(focused < 0 || focused >= last ? 0 : focused + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                move(focused <= 0 ? last : focused - 1);
                break;
            case 'Home':
                e.preventDefault();
                move(0);
                break;
            case 'End':
                e.preventDefault();
                move(last);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focused >= 0) handleLanguageChange(locales[focused] as Locale);
                break;
            case 'Tab':
                close(false);
                break;
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={buttonRef}
                id={buttonId}
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                onKeyDown={onButtonKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                aria-label={`Language: ${currentMeta.label}`}
                className="flex w-full min-h-10 items-center gap-2.5 rounded-xl border border-amber-200/20 bg-stone-900/60 px-3 py-2 text-left font-serif text-sm text-amber-50 transition-colors hover:border-amber-200/40 hover:bg-stone-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0807]"
            >
                <FaGlobe aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-300" />
                <span lang={currentLocale} className="min-w-0 flex-1 truncate">{currentMeta.label}</span>
                <FaChevronDown
                    aria-hidden="true"
                    className={`h-3 w-3 shrink-0 text-amber-200/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                // absolute で重ねて出すので、開いても周りの行はずれない。
                // 幅はボタンと同じ（ドロワー幅の内側）なので、360px 幅の端末でも画面からはみ出さない。
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    aria-labelledby={buttonId}
                    onKeyDown={onListKeyDown}
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(60vh,22rem)] overflow-y-auto rounded-xl border border-amber-200/20 bg-[#100b0a] p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]"
                >
                    {locales.map((locale, i) => {
                        const selected = locale === currentLocale;
                        return (
                            <li
                                key={locale}
                                ref={(el) => { optionRefs.current[i] = el; }}
                                role="option"
                                aria-selected={selected}
                                aria-current={selected ? 'true' : undefined}
                                tabIndex={-1}
                                lang={locale}
                                onClick={() => handleLanguageChange(locale as Locale)}
                                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-serif text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300/60 ${selected
                                    ? 'bg-amber-300/15 text-amber-100'
                                    : 'text-amber-50/85 hover:bg-stone-100/5 focus:bg-stone-100/5'
                                    }`}
                            >
                                <span className="min-w-0 flex-1 truncate">{localeMeta[locale].label}</span>
                                {selected && <FaCheck aria-hidden="true" className="h-3 w-3 shrink-0 text-amber-300" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
