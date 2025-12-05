"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-xl md:text-2xl font-bold font-serif hover:text-pink-500 transition-colors">
                    Garuchan News
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 font-medium">
                    <Link href="/" className="hover:text-pink-400 transition-colors">
                        ホーム
                    </Link>
                    <Link href="/novels" className="hover:text-pink-400 transition-colors">
                        ニュース
                    </Link>
                    <Link href="/game" className="hover:text-pink-400 transition-colors">
                        ゲーム
                    </Link>
                    <Link href="/about" className="hover:text-pink-400 transition-colors">
                        運営者情報
                    </Link>
                    <Link href="/contact" className="hover:text-pink-400 transition-colors">
                        お問い合わせ
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-white"></div>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <nav className="md:hidden bg-gray-800 border-t border-gray-700">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link
                            href="/"
                            className="hover:text-pink-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ホーム
                        </Link>
                        <Link
                            href="/novels"
                            className="hover:text-pink-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ニュース
                        </Link>
                        <Link
                            href="/game"
                            className="hover:text-pink-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ゲーム
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-pink-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            運営者情報
                        </Link>
                        <Link
                            href="/contact"
                            className="hover:text-pink-400 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            お問い合わせ
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
