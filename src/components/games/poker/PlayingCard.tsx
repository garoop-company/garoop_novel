"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface CardProps {
    suit: Suit;
    rank: Rank;
    hidden?: boolean;
    className?: string;
    index?: number; // For stagger effect
}

const PlayingCard: React.FC<CardProps> = ({ suit, rank, hidden = false, className = "", index = 0 }) => {
    const isRed = suit === '♥' || suit === '♦';

    const renderCenter = () => {
        if (hidden) return null;

        // Custom Garuchan Faces for J, Q, K, A
        if (['J', 'Q', 'K', 'A'].includes(rank)) {
            return (
                <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-lg bg-yellow-50/50">
                    <Image
                        src="/images/garuchan.png"
                        alt="Garuchan"
                        width={80}
                        height={80}
                        className="object-contain opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-black ${isRed ? 'text-red-500' : 'text-black'} drop-shadow-sm`}>
                            {rank}
                        </span>
                    </div>
                </div>
            );
        }

        // Number cards
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-3xl ${isRed ? 'text-red-500' : 'text-black'}`}>{suit}</span>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
            animate={{ rotateY: hidden ? 180 : 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative w-20 h-28 md:w-24 md:h-36 rounded-xl shadow-xl preserve-3d ${className}`}
            style={{ perspective: '1000px' }}
        >
            {/* Front of Card */}
            <div
                className="absolute inset-0 bg-white rounded-xl border-2 border-gray-200 shadow-inner flex flex-col p-2 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
            >
                {/* Top Corner */}
                <div className="flex flex-col leading-none items-center w-6">
                    <span className={`text-lg font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>{rank}</span>
                    <span className={`text-lg ${isRed ? 'text-red-500' : 'text-black'}`}>{suit}</span>
                </div>

                {/* Center Art */}
                <div className="flex-1 relative">
                    {renderCenter()}
                </div>

                {/* Bottom Corner (Rotated) */}
                <div className="flex flex-col leading-none items-center w-6 self-end rotate-180">
                    <span className={`text-lg font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>{rank}</span>
                    <span className={`text-lg ${isRed ? 'text-red-500' : 'text-black'}`}>{suit}</span>
                </div>
            </div>

            {/* Back of Card */}
            <div
                className="absolute inset-0 bg-pink-500 rounded-xl border-2 border-white shadow-md backface-hidden flex items-center justify-center overflow-hidden"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
                <div className="absolute inset-1 border-2 border-dashed border-white/50 rounded-lg"></div>
                <Image
                    src="/images/garuchan.png"
                    alt="Card Back"
                    width={60}
                    height={60}
                    className="object-contain drop-shadow-md"
                />
            </div>
        </motion.div>
    );
};

export default PlayingCard;
