import React, { useState } from 'react';
import MatchingScreen from './components/MatchingScreen';
import PokerEngine from './components/PokerEngine';
import { AnimatePresence, motion } from 'framer-motion';

const PokerGameContainer = () => {
    const [gameState, setGameState] = useState<'matching' | 'playing'>('matching');

    return (
        <div className="w-full h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-black overflow-hidden relative font-sans">

            {/* Background Particles/Effect */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>

            <AnimatePresence mode="wait">
                {gameState === 'matching' && (
                    <motion.div
                        key="matching"
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50"
                    >
                        <MatchingScreen onMatchFound={() => setGameState('playing')} />
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-10"
                    >
                        <PokerEngine />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PokerGameContainer;
