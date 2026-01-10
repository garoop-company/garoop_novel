import React from 'react';
import { motion } from 'framer-motion';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface AnimalCardProps {
    suit: Suit;
    rank: Rank;
    index?: number;
    hidden?: boolean;
}

const SUIT_CONFIG: Record<Suit, { icon: string, color: string, animal: string }> = {
    '♠': { icon: '🦁', color: 'text-yellow-600', animal: 'Lion' }, // Strong/King
    '♥': { icon: '🐰', color: 'text-pink-500', animal: 'Rabbit' }, // Cute
    '♦': { icon: '🦊', color: 'text-orange-500', animal: 'Fox' }, // Clever
    '♣': { icon: '🐻', color: 'text-brown-600', animal: 'Bear' }, // Wild (Brown-ish, map to amber)
};

const AnimalCard: React.FC<AnimalCardProps> = ({ suit, rank, index = 0, hidden = false }) => {
    const config = SUIT_CONFIG[suit];
    const isRed = ['♥', '♦'].includes(suit);

    if (hidden) {
        return (
            <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-16 h-24 md:w-24 md:h-36 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-lg border-2 border-white/20 shadow-xl flex items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                <div className="text-4xl">⚜️</div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: index * 0.1 }}
            className="w-16 h-24 md:w-24 md:h-36 bg-white rounded-lg border-2 border-slate-200 shadow-xl relative overflow-hidden flex flex-col items-center justify-between p-1 select-none"
        >
            {/* Top Left */}
            <div className="self-start flex flex-col items-center leading-none">
                <span className={`text-sm md:text-lg font-black ${isRed ? config.color : 'text-slate-800'}`}>{rank}</span>
                <span className="text-xs">{config.icon}</span>
            </div>

            {/* Center Art */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-5xl filter drop-shadow-sm transform scale-125">
                {config.icon}
            </div>

            {/* Bottom Right (Rotated) */}
            <div className="self-end flex flex-col items-center leading-none transform rotate-180">
                <span className={`text-sm md:text-lg font-black ${isRed ? config.color : 'text-slate-800'}`}>{rank}</span>
                <span className="text-xs">{config.icon}</span>
            </div>
        </motion.div>
    );
};

export default AnimalCard;
