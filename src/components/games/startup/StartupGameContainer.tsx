"use client";

import React from 'react';
import { useStartupStore } from './store';
import IndustrySelect from './components/IndustrySelect';
import Dashboard from './components/Dashboard';
import BattleScene from './components/BattleScene';
import { AnimatePresence, motion } from 'framer-motion';

const StartupGameContainer = () => {
    const phase = useStartupStore(state => state.phase);
    const { isGameOver, gameResult, companyName, capital, resetGame } = useStartupStore();

    return (
        <div className="w-full h-screen overflow-hidden font-sans select-none relative">
            <AnimatePresence mode="wait">
                {phase === 'industry_select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-10"
                    >
                        <IndustrySelect />
                    </motion.div>
                )}

                {phase === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-0"
                    >
                        <Dashboard />
                    </motion.div>
                )}

                {phase === 'battle' && (
                    <motion.div
                        key="battle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20"
                    >
                        <BattleScene />
                    </motion.div>
                )}

                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
                            <div className="text-6xl mb-4">
                                {gameResult === 'IPO' ? '🎉' : gameResult === 'M&A' ? '🤝' : '💸'}
                            </div>
                            <h2 className={`text-4xl font-black mb-2 ${gameResult === 'BANKRUPT' ? 'text-gray-800' : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                                {gameResult === 'IPO' ? 'IPO達成!!' : gameResult === 'M&A' ? 'M&A成功!' : '倒産...'}
                            </h2>
                            <p className="text-gray-500 mb-8 font-bold text-lg">
                                {gameResult === 'BANKRUPT'
                                    ? `残念... ${companyName} の挑戦はここで終わった。`
                                    : `おめでとう！ ${companyName} は伝説になった！`
                                }
                            </p>

                            <div className="bg-gray-100 rounded-xl p-4 mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">最終資金</span>
                                    <span className="font-mono font-bold">{capital} garu</span>
                                </div>
                            </div>

                            <button
                                onClick={resetGame}
                                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                もう一度挑戦する
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StartupGameContainer;
