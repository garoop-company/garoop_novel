"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b-4 border-pink-400 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        🎡
                    </div>
                    <Link href="/" className="text-xl md:text-2xl font-black text-pink-600 tracking-wider hover:text-pink-400 transition-colors">
                        GARUCHAN LAND
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6 font-bold text-gray-600">
                    <Link href="/" className="hover:text-pink-500 transition-colors py-2">
                        ホーム
                    </Link>
                    <Link href="/novels" className="hover:text-pink-500 transition-colors py-2">
                        ニュース
                    </Link>
                    <Link href="/game" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all">
                        ゲームで遊ぶ 🎮
                    </Link>
                    <Link href="/about" className="hover:text-pink-500 transition-colors py-2">
                        運営者情報
                    </Link>
                    <Link href="/contact" className="hover:text-pink-500 transition-colors py-2">
                        お問い合わせ
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className="w-6 h-0.5 bg-pink-500 mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-pink-500 mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-pink-500"></div>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <nav className="md:hidden bg-white border-t border-pink-100">
                    <div className="flex flex-col p-4 space-y-4 font-bold text-gray-600">
                        <Link
                            href="/"
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ホーム
                        </Link>
                        <Link
                            href="/novels"
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ニュース
                        </Link>
                        <Link
                            href="/game"
                            className="text-pink-500"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ゲームで遊ぶ 🎮
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            運営者情報
                        </Link>
                        <Link
                            href="/contact"
                            className="hover:text-pink-500 transition-colors"
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
