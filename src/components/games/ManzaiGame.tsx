"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Types ---
interface ScriptLine {
    speaker: 'boke' | 'tsukkomi';
    text: string;
    isPunchline?: boolean;
    wait?: number; // Time to wait before next line
}

const SCRIPTS: ScriptLine[] = [
    { speaker: 'tsukkomi', text: 'どうもー！ ガルちゃんズです！', wait: 2000 },
    { speaker: 'boke', text: 'よろしく おねがいしまーす！', wait: 2000 },
    { speaker: 'tsukkomi', text: '最近さ、AIってすごいよね。', wait: 2500 },
    { speaker: 'boke', text: 'ああ、あの「愛」のことね。ラブだよね。', isPunchline: true, wait: 3000 },
    { speaker: 'tsukkomi', text: 'いや、人工知能のほうだよ！', wait: 2500 },
    { speaker: 'boke', text: 'あーそっちか。僕も最近AI使って料理してるんだ。', wait: 2500 },
    { speaker: 'tsukkomi', text: 'へー、レシピとか教えてくれるの？', wait: 2500 },
    { speaker: 'boke', text: 'ううん、AIが代わりに食べてくれるの。', isPunchline: true, wait: 3000 },
    { speaker: 'tsukkomi', text: '意味ないやろ！ お前が食えよ！', wait: 2500 },
    { speaker: 'boke', text: 'でもさ、将来はロボットと漫才する時代が来るかもね。', wait: 2500 },
    { speaker: 'tsukkomi', text: 'まあ、ありえるかもな。', wait: 2000 },
    { speaker: 'boke', text: '「ウィーン、ガシャン。ナンデヤネン」', isPunchline: true, wait: 3000 },
    { speaker: 'tsukkomi', text: '情緒がないわ！', wait: 2000 },
    { speaker: 'boke', text: 'もうええわ。', wait: 1000 },
    { speaker: 'tsukkomi', text: 'ありがとうございましたー。', wait: 1000 },
];

export default function ManzaiGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setIsPlaying(true);
        setIsFinished(false);
        setCurrentIndex(0);
        setScore(0);
        setFeedback('');
        playNextLine(0);
    };

    const playNextLine = (index: number) => {
        if (index >= SCRIPTS.length) {
            finishGame();
            return;
        }

        const line = SCRIPTS[index];
        setCurrentIndex(index);

        // Auto advance if not a punchline (or if player misses punchline)
        timerRef.current = setTimeout(() => {
            if (line.isPunchline) {
                // Player missed the timing
                setFeedback('おそい！');
            }
            playNextLine(index + 1);
        }, line.wait || 2000);
    };

    const handleTsukkomi = () => {
        if (!isPlaying || isFinished) return;

        const currentLine = SCRIPTS[currentIndex];

        if (currentLine.isPunchline) {
            // Success!
            const points = 100;
            setScore(prev => prev + points);
            setFeedback('ナイスツッコミ！ 👍');

            // Visual effect for Tsukkomi
            // Cancel current timer and move to next immediately to keep flow? 
            // Or just let it flow. Let's just add score.
        } else {
            // Fail!
            setScore(prev => Math.max(0, prev - 50));
            setFeedback('まだ早い！ 💦');
        }

        // Clear feedback after a moment
        setTimeout(() => setFeedback(''), 1000);
    };

    const finishGame = () => {
        setIsPlaying(false);
        setIsFinished(true);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-orange-100 font-sans text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-50 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-orange-700 mb-8 z-10 drop-shadow-sm">
                ツッコミの達人
            </h1>

            {/* Stage */}
            <div className="relative w-full max-w-3xl aspect-video bg-white rounded-3xl shadow-2xl border-8 border-orange-300 overflow-hidden flex flex-col">

                {/* Curtains */}
                <div className="absolute top-0 left-0 w-12 h-full bg-red-700 z-10"></div>
                <div className="absolute top-0 right-0 w-12 h-full bg-red-700 z-10"></div>
                <div className="absolute top-0 left-0 w-full h-12 bg-red-700 z-10 flex justify-center items-center text-white font-bold text-xl">
                    GAROOP THEATER
                </div>

                {/* Background */}
                <div className="absolute inset-0 bg-[url('/images/stage_bg.png')] bg-cover bg-center opacity-50"></div>

                {/* Characters */}
                <div className="flex-1 flex items-end justify-center gap-8 pb-10 z-0 relative mt-12">
                    {/* Tsukkomi (Left) */}
                    <motion.div
                        className="w-1/3 h-2/3 relative"
                        animate={SCRIPTS[currentIndex]?.speaker === 'tsukkomi' ? { y: -10 } : { y: 0 }}
                    >
                        <Image src="/images/garoop_thinking.png" alt="Tsukkomi" fill className="object-contain" />
                        {SCRIPTS[currentIndex]?.speaker === 'tsukkomi' && (
                            <div className="absolute -top-20 -left-10 bg-white p-4 rounded-2xl border-4 border-blue-500 shadow-lg min-w-[200px]">
                                <p className="font-bold text-lg">{SCRIPTS[currentIndex].text}</p>
                                <div className="absolute bottom-[-10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-500"></div>
                            </div>
                        )}
                    </motion.div>

                    {/* Boke (Right) */}
                    <motion.div
                        className="w-1/3 h-2/3 relative"
                        animate={SCRIPTS[currentIndex]?.speaker === 'boke' ? { y: -10 } : { y: 0 }}
                    >
                        <Image src="/images/garoop_happy.png" alt="Boke" fill className="object-contain" />
                        {SCRIPTS[currentIndex]?.speaker === 'boke' && (
                            <div className="absolute -top-20 -right-10 bg-white p-4 rounded-2xl border-4 border-red-500 shadow-lg min-w-[200px]">
                                <p className="font-bold text-lg">{SCRIPTS[currentIndex].text}</p>
                                <div className="absolute bottom-[-10px] right-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-500"></div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1.5, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                        >
                            <span className="text-6xl font-black text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] stroke-black stroke-2">
                                {feedback}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Start Screen */}
                {!isPlaying && !isFinished && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-30">
                        <p className="text-2xl font-bold mb-8 text-center">
                            ボケが おかしなことを いったら<br />
                            ボタンをおして ツッコミを いれろ！
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-orange-500 text-white px-8 py-4 rounded-full font-black text-2xl hover:bg-orange-600 shadow-lg animate-bounce"
                        >
                            漫才 スタート！
                        </button>
                    </div>
                )}

                {/* Result Screen */}
                {isFinished && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30">
                        <p className="text-4xl font-black text-yellow-400 mb-4">しゅうりょう！</p>
                        <p className="text-2xl font-bold mb-8">あなたのスコア: {score}てん</p>
                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600"
                            >
                                もういちど
                            </button>
                            <Link href="/game" className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600">
                                ゲームいちらんへ
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Tsukkomi Button */}
            <button
                onClick={handleTsukkomi}
                disabled={!isPlaying}
                className={`
            mt-8 w-full max-w-md py-6 rounded-2xl font-black text-3xl shadow-[0_10px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[10px] transition-all
            ${isPlaying ? 'bg-red-600 text-white hover:bg-red-500 cursor-pointer' : 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-none'}
        `}
            >
                なんでやねん！ ✋
            </button>

            <p className="mt-4 text-gray-500 font-bold">
                PCなら スペースキーでも ツッコミできるよ！ (未実装)
            </p>

        </div>
    );
}
