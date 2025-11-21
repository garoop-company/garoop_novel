"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Data ---
const GENRES = [
    { id: 'action', name: 'アクション', icon: '💥' },
    { id: 'romance', name: 'ロマンス', icon: '💖' },
    { id: 'horror', name: 'ホラー', icon: '👻' },
    { id: 'scifi', name: 'SF', icon: '🚀' },
    { id: 'comedy', name: 'コメディ', icon: '🤣' },
];

const THEMES = [
    { id: 'space', name: 'うちゅう', icon: '🪐' },
    { id: 'school', name: 'がっこう', icon: '🏫' },
    { id: 'zombie', name: 'ゾンビ', icon: '🧟' },
    { id: 'history', name: 'じだいげき', icon: '🏯' },
    { id: 'animal', name: 'どうぶつ', icon: '🐶' },
];

const ACTORS = [
    { id: 'happy', name: '元気なガルちゃん', image: '/images/garoop_happy.png' },
    { id: 'cool', name: 'クールなガルちゃん', image: '/images/garoop_thinking.png' },
    { id: 'wild', name: 'ワイルドなガルちゃん', image: '/images/garoop_battle.png' },
];

export default function MovieGame() {
    const [step, setStep] = useState<'genre' | 'theme' | 'actor' | 'result'>('genre');
    const [selection, setSelection] = useState({ genre: '', theme: '', actor: '' });
    const [result, setResult] = useState({ score: 0, title: '', review: '' });

    const handleSelect = (key: string, value: string) => {
        setSelection(prev => ({ ...prev, [key]: value }));
        if (key === 'genre') setStep('theme');
        if (key === 'theme') setStep('actor');
        if (key === 'actor') calculateResult({ ...selection, actor: value });
    };

    const calculateResult = (finalSelection: typeof selection) => {
        setStep('result');

        // Simple Logic for Score
        let score = Math.floor(Math.random() * 50) + 50; // Base 50-100
        let title = '';
        let review = '';

        // Combos
        const { genre, theme, actor } = finalSelection;

        if (genre === 'scifi' && theme === 'space') {
            score += 20;
            title = 'スター・ガル・ウォーズ';
            review = '王道のSF超大作！ 全米が泣いた！';
        } else if (genre === 'horror' && theme === 'zombie') {
            score += 15;
            title = 'バイオ・ガル・ハザード';
            review = '怖すぎて トイレにいけない...';
        } else if (genre === 'romance' && theme === 'school') {
            score += 15;
            title = '恋する ガルちゃん';
            review = '青春って いいね！ キュンキュンした！';
        } else if (genre === 'action' && theme === 'history') {
            score = 95;
            title = 'ラスト・サムライ・ガル';
            review = '歴史に残る 名作アクション！';
        } else {
            // Random Titles
            title = `ガルちゃんの ${GENRES.find(g => g.id === genre)?.name} 映画`;
            review = 'なかなか 面白かった！ 続編に期待。';
        }

        // Actor Bonus
        if (actor === 'wild' && genre === 'action') score += 10;
        if (actor === 'happy' && genre === 'comedy') score += 10;
        if (actor === 'cool' && genre === 'scifi') score += 10;

        setResult({ score: Math.min(100, score), title, review });
    };

    const reset = () => {
        setStep('genre');
        setSelection({ genre: '', theme: '', actor: '' });
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-yellow-400 mb-8 z-10 drop-shadow-sm">
                🎬 ガルちゃん スタジオ
            </h1>

            {/* Main Card */}
            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl max-w-4xl w-full min-h-[500px] flex flex-col items-center justify-center relative z-10">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded-t-3xl overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: step === 'genre' ? '25%' : step === 'theme' ? '50%' : step === 'actor' ? '75%' : '100%' }}
                    ></div>
                </div>

                {/* STEP 1: GENRE */}
                {step === 'genre' && (
                    <div className="w-full text-center">
                        <h2 className="text-2xl font-bold mb-8">どんな ジャンル の映画をつくる？</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {GENRES.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => handleSelect('genre', g.id)}
                                    className="bg-blue-100 hover:bg-blue-200 p-6 rounded-xl flex flex-col items-center gap-2 transition-transform hover:scale-105"
                                >
                                    <span className="text-4xl">{g.icon}</span>
                                    <span className="font-bold">{g.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: THEME */}
                {step === 'theme' && (
                    <div className="w-full text-center">
                        <h2 className="text-2xl font-bold mb-8">テーマ はどうする？</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSelect('theme', t.id)}
                                    className="bg-green-100 hover:bg-green-200 p-6 rounded-xl flex flex-col items-center gap-2 transition-transform hover:scale-105"
                                >
                                    <span className="text-4xl">{t.icon}</span>
                                    <span className="font-bold">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: ACTOR */}
                {step === 'actor' && (
                    <div className="w-full text-center">
                        <h2 className="text-2xl font-bold mb-8">しゅやく は誰にする？</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            {ACTORS.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => handleSelect('actor', a.id)}
                                    className="bg-pink-100 hover:bg-pink-200 p-4 rounded-xl flex flex-col items-center gap-2 transition-transform hover:scale-105 w-40"
                                >
                                    <div className="w-32 h-32 relative">
                                        <Image src={a.image} alt={a.name} fill className="object-contain" />
                                    </div>
                                    <span className="font-bold text-sm">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* RESULT */}
                {step === 'result' && (
                    <div className="w-full text-center animate-in fade-in zoom-in duration-500">
                        <h2 className="text-xl font-bold text-gray-500 mb-2">完成！ 新作映画ポスター</h2>
                        <h3 className="text-4xl font-black text-slate-800 mb-6">{result.title}</h3>

                        <div className="flex justify-center mb-8">
                            <div className="w-48 h-64 bg-black rounded-lg shadow-xl relative overflow-hidden flex flex-col items-center justify-end pb-4 border-4 border-gold">
                                {/* Poster Mockup */}
                                <div className="absolute inset-0 opacity-50">
                                    <Image
                                        src={ACTORS.find(a => a.id === selection.actor)?.image || ''}
                                        alt="Poster"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="relative z-10 text-white font-serif text-2xl font-bold drop-shadow-md">
                                    {result.title}
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-100 p-6 rounded-xl mb-8 inline-block">
                            <p className="text-sm text-gray-500 font-bold mb-2">批評家のレビュー</p>
                            <p className="text-xl font-bold text-yellow-800">「{result.review}」</p>
                            <div className="mt-4 text-5xl font-black text-red-500">
                                {result.score}<span className="text-2xl text-gray-400">点</span>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={reset}
                                className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 shadow-lg"
                            >
                                つぎの さくひんを つくる
                            </button>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
