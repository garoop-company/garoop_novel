"use client";

import React from 'react';
import { useStartupStore } from '../store';
import { INDUSTRIES } from '../constants';
import { motion } from 'framer-motion';

const IndustrySelect = () => {
    const setIndustry = useStartupStore(state => state.setIndustry);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-600 drop-shadow-lg">
                Garoop Startup
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 font-bold">
                〜生成AIで世界を変える動物たち〜
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
                {INDUSTRIES.map((industry, index) => (
                    <motion.div
                        key={industry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIndustry(industry.id)}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-colors shadow-xl"
                    >
                        <div className="text-4xl mb-4 text-center">
                            {industry.id === 'AI_ART' ? '🎨' : industry.id === 'AI_CHAT' ? '💬' : '🤖'}
                        </div>
                        <h3 className="text-xl font-black mb-2 text-center text-yellow-400">{industry.name}</h3>
                        <p className="text-sm text-gray-300 mb-4 h-16">{industry.description}</p>

                        <div className="flex justify-between text-xs font-mono text-gray-400 border-t border-white/10 pt-4">
                            <span>難易度: <span className={industry.difficulty === 'Easy' ? 'text-green-400' : industry.difficulty === 'Normal' ? 'text-blue-400' : 'text-red-400'}>{industry.difficulty}</span></span>
                            <span>市場規模: x{industry.marketSizeMultiplier}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default IndustrySelect;
