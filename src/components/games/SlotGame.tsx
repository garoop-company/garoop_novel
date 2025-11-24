"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// --- Constants ---
const SYMBOLS = ['🤖', '🐉', '⚡', '💎', '7️⃣', '👾', '🪐'];
const REEL_COUNT = 3;
const SPIN_DURATION = 2000;

export default function SlotGame() {
    const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
    const [isSpinning, setIsSpinning] = useState(false);
    const [message, setMessage] = useState('スピンして スタート！');
    const [coins, setCoins] = useState(100);
    const [winAmount, setWinAmount] = useState(0);

    const spin = () => {
        if (isSpinning || coins < 10) return;

        setIsSpinning(true);
        setCoins(prev => prev - 10);
        setWinAmount(0);
        setMessage('グルグルグル...');

        // Simulate spinning visual
        const interval = setInterval(() => {
            setReels(prev => prev.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            const finalReels = [
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            ];
            setReels(finalReels);
            checkWin(finalReels);
            setIsSpinning(false);
        }, SPIN_DURATION);
    };

    const checkWin = (finalReels: string[]) => {
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            // Jackpot
            let win = 0;
            if (finalReels[0] === '7️⃣') win = 500;
            else if (finalReels[0] === '💎') win = 300;
            else if (finalReels[0] === '🐉') win = 200;
            else win = 100;

            setCoins(prev => prev + win);
            setWinAmount(win);
            setMessage(`大当り！ ${win}コイン GET！ 🎉`);
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
            // Small Win (2 match)
            const win = 20;
            setCoins(prev => prev + win);
            setWinAmount(win);
            setMessage(`おしい！ ${win}コイン GET！`);
        } else {
            setMessage('ざんねん... 次に期待！');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/images/grid.png')] opacity-20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/50 to-blue-900/50"></div>

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-purple-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-purple-100 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                CYBER SLOTS
            </h1>

            {/* Slot Machine */}
            <div className="bg-slate-800 p-8 rounded-3xl border-8 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative z-10 max-w-2xl w-full">

                {/* Reels */}
                <div className="flex justify-center gap-4 mb-8 bg-black p-4 rounded-xl border-4 border-slate-600">
                    {reels.map((symbol, index) => (
                        <div key={index} className="w-24 h-32 md:w-32 md:h-40 bg-white rounded-lg flex items-center justify-center text-6xl md:text-8xl shadow-inner overflow-hidden relative">
                            <motion.div
                                key={isSpinning ? 'spinning' : 'stopped'}
                                animate={isSpinning ? { y: [0, -100, 0] } : { y: 0 }}
                                transition={isSpinning ? { repeat: Infinity, duration: 0.1 } : {}}
                            >
                                {symbol}
                            </motion.div>
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6">
                    <div className="text-2xl font-bold text-cyan-400">{message}</div>

                    <div className="flex items-center gap-8 w-full justify-center">
                        <div className="bg-slate-900 px-6 py-3 rounded-xl border-2 border-slate-600">
                            <span className="text-gray-400 text-sm block">COINS</span>
                            <span className="text-3xl font-mono text-yellow-400">{coins}</span>
                        </div>

                        <button
                            onClick={spin}
                            disabled={isSpinning || coins < 10}
                            className={`
                  w-32 h-32 rounded-full border-8 border-b-8 
                  flex items-center justify-center text-2xl font-black shadow-xl transition-all
                  ${isSpinning || coins < 10
                                    ? 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 border-red-700 text-white hover:bg-red-400 hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-2'}
                `}
                        >
                            SPIN
                        </button>

                        <div className="bg-slate-900 px-6 py-3 rounded-xl border-2 border-slate-600">
                            <span className="text-gray-400 text-sm block">WIN</span>
                            <span className="text-3xl font-mono text-green-400">{winAmount}</span>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm">COST: 10 COINS</p>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex gap-4 flex-wrap justify-center text-sm text-gray-400 z-10">
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full"><span className="text-2xl">7️⃣</span> x3 = 500</div>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full"><span className="text-2xl">💎</span> x3 = 300</div>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full"><span className="text-2xl">🐉</span> x3 = 200</div>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">Any Pair = 20</div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 opacity-70 z-10">
                ※このゲームは完全無料のシミュレーションです。金銭の賭け事は一切行われません。<br />
                (This game is a free simulation. No real money gambling is involved.)
            </div>

        </div>
    );
}
