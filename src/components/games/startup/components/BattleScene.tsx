"use client";

import React, { useEffect, useState } from 'react';
import { useStartupStore } from '../store';
import { motion } from 'framer-motion';

const BattleScene = () => {
    const { currentRival, productLevel, brandAwareness, resolveBattle } = useStartupStore();
    const [battleState, setBattleState] = useState<'intro' | 'clash' | 'result'>('intro');

    const myPower = productLevel + brandAwareness;
    const rivalPower = currentRival?.power || 50;
    const isWin = myPower >= rivalPower;

    useEffect(() => {
        if (battleState === 'intro') {
            setTimeout(() => setBattleState('clash'), 2000);
        } else if (battleState === 'clash') {
            setTimeout(() => setBattleState('result'), 2000);
        }
    }, [battleState]);

    const handleFinish = () => {
        resolveBattle();
    };

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden z-50">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-blue-900 opacity-50 animate-pulse"></div>

            <h1 className="text-4xl md:text-6xl font-black text-white italic mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] skew-x-[-10deg]">
                PITCH BATTLE!!
            </h1>

            <div className="flex justify-between items-center w-full max-w-4xl px-4 md:px-12 relative">

                {/* YOUR COMPANY */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-2xl font-bold text-blue-400 mb-4">YOU</div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-800 relative shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">🤖</div>
                    </div>
                    {battleState !== 'intro' && (
                        <div className="mt-4 text-4xl font-black text-white font-mono">
                            {Math.floor(myPower)}
                        </div>
                    )}
                </motion.div>

                {/* VS */}
                <div className="text-6xl font-black text-yellow-500 italic z-10">VS</div>

                {/* RIVAL */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-2xl font-bold text-red-500 mb-4">RIVAL</div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-500 overflow-hidden bg-gray-800 relative shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">🦖</div>
                    </div>
                    {battleState !== 'intro' && (
                        <div className="mt-4 text-4xl font-black text-white font-mono">
                            {Math.floor(rivalPower)}
                        </div>
                    )}
                </motion.div>

            </div>

            {/* Result Overlay */}
            {battleState === 'result' && (
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20"
                >
                    <div className={`text-6xl md:text-9xl font-black mb-8 ${isWin ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {isWin ? 'WINNER!' : 'DEFEAT...'}
                    </div>
                    <p className="text-xl text-white mb-8">
                        {isWin ? 'Market Share +5%, Users Increased!' : 'Market Share decreased...'}
                    </p>
                    <button
                        onClick={handleFinish}
                        className="bg-white text-black font-bold py-4 px-12 rounded-full text-xl hover:scale-105 transition-transform"
                    >
                        CONTINUE
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default BattleScene;
