import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MatchingScreenProps {
    onMatchFound: () => void;
}

const MatchingScreen: React.FC<MatchingScreenProps> = ({ onMatchFound }) => {
    const [status, setStatus] = useState('searching'); // searching, found

    useEffect(() => {
        // Simulate finding opponent
        const timer = setTimeout(() => {
            setStatus('found');
            setTimeout(() => {
                onMatchFound();
            }, 2000); // Wait 2s after found before starting
        }, 3000); // 3s search time

        return () => clearTimeout(timer);
    }, [onMatchFound]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 text-white p-8 absolute inset-0">
            {status === 'searching' ? (
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-full h-full border-4 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                            🔍
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold animate-pulse">対戦相手を探しています...</h2>
                    <p className="text-gray-400 mt-2">（世界中のプレイヤーから検索中）</p>
                </div>
            ) : (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <h2 className="text-4xl font-black text-yellow-400 mb-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                        MATCH FOUND!
                    </h2>

                    <div className="flex items-center gap-8">
                        {/* Player */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden relative">
                                <Image src="/images/garoop_happy.png" alt="You" fill className="object-cover" />
                            </div>
                            <span className="mt-2 font-bold">あなた</span>
                        </div>

                        <div className="text-3xl font-black italic text-red-500">VS</div>

                        {/* Opponent */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-4 border-red-500 overflow-hidden relative bg-gray-800">
                                <Image src="/images/garoop_thinking.png" alt="Rival" fill className="object-cover" />
                            </div>
                            <span className="mt-2 font-bold">ライバル</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MatchingScreen;
