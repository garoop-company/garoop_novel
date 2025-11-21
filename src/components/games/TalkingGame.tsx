"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function TalkingGame() {
    const [message, setMessage] = useState('ガルちゃんを タップしてね！');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = (text: string) => {
        if (isSpeaking) return;

        setIsSpeaking(true);
        setMessage(text);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.2;
        utterance.pitch = 1.5; // Higher pitch for kid-friendly voice

        // Try to find a Japanese voice
        const jpVoice = voices.find(v => v.lang.includes('ja'));
        if (jpVoice) utterance.voice = jpVoice;

        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleTouch = (part: string) => {
        const phrases = {
            head: ['なでなで してくれたの？ うれしいな！', 'えへへ、くすぐったいよ〜', 'あたま いいこ いいこ！'],
            face: ['ほっぺた ぷにぷに だよ！', 'おなかすいたなぁ〜', 'にらめっこ しよう！'],
            body: ['おなか いっぱい！', 'だっこ して〜！', 'げんき いっぱい だよ！'],
            hand: ['あくしゅ！', 'ハイタッチ！ イェーイ！', 'いっしょに あそぼ！'],
            foot: ['かけっこ なら まけないよ！', 'ジャンプ！ ジャンプ！', 'くつ した おきにいり なんだ！']
        };

        const partPhrases = phrases[part as keyof typeof phrases];
        const randomPhrase = partPhrases[Math.floor(Math.random() * partPhrases.length)];
        speak(randomPhrase);
    };

    return (
        <div className="min-h-screen bg-pink-50 font-sans text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-50 animate-bounce"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-pink-500 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-pink-100 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-pink-600 mb-8 z-10 drop-shadow-sm">
                おしゃべり ガルちゃん
            </h1>

            {/* Message Bubble */}
            <motion.div
                className="bg-white p-6 rounded-3xl shadow-xl border-4 border-pink-400 mb-8 max-w-md w-full text-center relative z-10"
                animate={{ scale: isSpeaking ? 1.05 : 1 }}
            >
                <p className="text-xl md:text-2xl font-bold text-gray-700">{message}</p>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-pink-400"></div>
            </motion.div>

            {/* Character Interaction Area */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 z-10">
                <Image
                    src="/images/garoop_happy.png"
                    alt="Garoop"
                    fill
                    className="object-contain pointer-events-none"
                />

                {/* Invisible Touch Zones */}
                {/* Head */}
                <button
                    onClick={() => handleTouch('head')}
                    className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-red-500/0 hover:bg-red-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Head"
                ></button>

                {/* Face */}
                <button
                    onClick={() => handleTouch('face')}
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/4 bg-blue-500/0 hover:bg-blue-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Face"
                ></button>

                {/* Body */}
                <button
                    onClick={() => handleTouch('body')}
                    className="absolute top-1/2 left-1/4 w-1/2 h-1/3 bg-green-500/0 hover:bg-green-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Body"
                ></button>

                {/* Hands */}
                <button
                    onClick={() => handleTouch('hand')}
                    className="absolute top-1/2 left-0 w-1/4 h-1/4 bg-yellow-500/0 hover:bg-yellow-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Left Hand"
                ></button>
                <button
                    onClick={() => handleTouch('hand')}
                    className="absolute top-1/2 right-0 w-1/4 h-1/4 bg-yellow-500/0 hover:bg-yellow-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Right Hand"
                ></button>

                {/* Feet */}
                <button
                    onClick={() => handleTouch('foot')}
                    className="absolute bottom-0 left-1/4 w-1/2 h-1/6 bg-purple-500/0 hover:bg-purple-500/20 rounded-full cursor-pointer transition-colors"
                    aria-label="Feet"
                ></button>
            </div>

            <p className="mt-8 text-gray-500 font-bold animate-pulse">
                いろんな ところを さわってみてね！
            </p>

        </div>
    );
}
