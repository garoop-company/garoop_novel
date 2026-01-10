"use client";

import React from 'react';
import { useStartupStore } from '../store';
import { INDUSTRIES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

import RecruitModal from './RecruitModal';

const Dashboard = () => {
    const {
        companyName, capital, users, productLevel, brandAwareness, turn, industry,
        nextTurn, performAction, workers
    } = useStartupStore();

    const [showRecruit, setShowRecruit] = React.useState(false);

    const currentIndustry = INDUSTRIES.find(i => i.id === industry);
    const valuation = users * 10;

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white relative overflow-hidden">
            {/* Header Stats */}
            <div className="flex justify-between items-start p-4 bg-gray-800 border-b border-gray-700 shadow-lg z-10">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        {companyName}
                    </h2>
                    <div className="text-xs text-gray-400 flex gap-2 items-center">
                        <span className="bg-gray-700 px-2 py-0.5 rounded">{currentIndustry?.name}</span>
                        <span>Week {turn}</span>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-8 text-right">
                    <div>
                        <div className="text-xs text-gray-400">Capital</div>
                        <div className={`font-mono font-bold text-xl ${capital < 20 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                            {capital.toLocaleString()} <span className="text-sm">garu</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Valuation</div>
                        <div className="font-mono font-bold text-xl text-green-400">
                            ${valuation.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Product Status */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>📦</span> Product
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Quality (Level {Math.floor(productLevel / 10)})</span>
                                <span className="font-mono">{productLevel}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(productLevel, 100)}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Active Users</span>
                                <span className="font-mono">{users.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((users / 10000) * 100, 100)}%` }} // Scale to 10k for visual
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marketing Status */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>📣</span> Marketing
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Brand Awareness</span>
                                <span className="font-mono">{brandAwareness}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(brandAwareness, 100)}%` }}
                                    className="h-full bg-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>👥</span> Team
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded ml-auto text-gray-300">Total: {workers.length}</span>
                    </h3>
                    <div className="flex gap-2 flex-wrap content-start">
                        {workers.map((w) => (
                            <div key={w.id} className="relative group w-12 h-12 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center text-2xl" title={`${w.name} (${w.role})`}>
                                {w.avatar}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold bg-blue-500 border border-gray-800">
                                    {w.skill}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowRecruit(true)}
                            className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl text-gray-400 border border-dashed border-gray-500 hover:bg-gray-600 hover:text-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between pb-safe">
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => performAction('develop')}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex flex-col items-center min-w-[100px] border-b-4 border-blue-800 disabled:opacity-50 disabled:border-b-0 disabled:translate-y-1"
                        disabled={capital < 20}
                    >
                        <span>💻 Develop</span>
                        <span className="text-xs opacity-70">-20 garu</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => performAction('marketing')}
                        className="flex-shrink-0 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl flex flex-col items-center min-w-[100px] border-b-4 border-pink-800 disabled:opacity-50 disabled:border-b-0 disabled:translate-y-1"
                        disabled={capital < 30}
                    >
                        <span>📣 Market</span>
                        <span className="text-xs opacity-70">-30 garu</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowRecruit(true)}
                        className="flex-shrink-0 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl flex flex-col items-center min-w-[100px] border-b-4 border-yellow-800"
                    >
                        <span>👔 Hire</span>
                        <span className="text-xs opacity-70">Recruit</span>
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={nextTurn}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black py-4 px-12 rounded-xl text-lg shadow-lg border-b-4 border-green-800 flex items-center justify-center gap-2"
                >
                    NEXT WEEK ▶
                </motion.button>
            </div>

            <AnimatePresence>
                {showRecruit && <RecruitModal onClose={() => setShowRecruit(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
