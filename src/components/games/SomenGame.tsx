"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Types ---
interface Noodle {
    id: number;
    x: number;
    y: number;
    speed: number;
    type: 'normal' | 'golden' | 'bomb';
}

export default function SomenGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Game State Refs (for loop)
    const noodlesRef = useRef<Noodle[]>([]);
    const scoreRef = useRef(0);
    const requestRef = useRef<number>();
    const lastSpawnTime = useRef(0);

    // Start Game
    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(30);
        noodlesRef.current = [];
        scoreRef.current = 0;
        lastSpawnTime.current = 0;
    };

    // Game Loop
    useEffect(() => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = (time: number) => {
            // Clear Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Bamboo Slide (Background)
            ctx.fillStyle = '#e6cfa1'; // Bamboo color
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Water
            ctx.fillStyle = '#aaddff';
            ctx.fillRect(50, 0, canvas.width - 100, canvas.height);

            // Draw Bamboo Joints
            ctx.strokeStyle = '#d4b483';
            ctx.lineWidth = 5;
            for (let i = 0; i < canvas.height; i += 100) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // Spawn Noodles
            if (time - lastSpawnTime.current > 800) { // Spawn every 800ms
                const typeRoll = Math.random();
                let type: 'normal' | 'golden' | 'bomb' = 'normal';
                if (typeRoll > 0.9) type = 'golden';
                else if (typeRoll > 0.8) type = 'bomb';

                noodlesRef.current.push({
                    id: Date.now(),
                    x: Math.random() * (canvas.width - 140) + 70, // Keep within water
                    y: -50,
                    speed: Math.random() * 3 + 2,
                    type
                });
                lastSpawnTime.current = time;
            }

            // Update & Draw Noodles
            noodlesRef.current.forEach((noodle, index) => {
                noodle.y += noodle.speed;

                // Draw Noodle
                ctx.beginPath();
                if (noodle.type === 'bomb') {
                    ctx.fillStyle = 'black';
                    ctx.arc(noodle.x, noodle.y, 20, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'red';
                    ctx.font = '20px Arial';
                    ctx.fillText('💣', noodle.x - 10, noodle.y + 5);
                } else {
                    ctx.strokeStyle = noodle.type === 'golden' ? 'gold' : 'white';
                    ctx.lineWidth = 4;
                    // Draw wavy line
                    ctx.moveTo(noodle.x, noodle.y - 20);
                    ctx.quadraticCurveTo(noodle.x + 10, noodle.y - 10, noodle.x, noodle.y);
                    ctx.quadraticCurveTo(noodle.x - 10, noodle.y + 10, noodle.x, noodle.y + 20);
                    ctx.stroke();

                    // Glow for golden
                    if (noodle.type === 'golden') {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = 'gold';
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }

                // Remove off-screen
                if (noodle.y > canvas.height) {
                    noodlesRef.current.splice(index, 1);
                }
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        // Timer
        const timerInterval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerInterval);
                    setIsPlaying(false);
                    setGameOver(true);
                    cancelAnimationFrame(requestRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            cancelAnimationFrame(requestRef.current!);
            clearInterval(timerInterval);
        };
    }, [isPlaying]);

    // Click Handler (Catch)
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Check collision
        noodlesRef.current.forEach((noodle, index) => {
            const dist = Math.sqrt((x - noodle.x) ** 2 + (y - noodle.y) ** 2);
            if (dist < 40) { // Hit radius
                if (noodle.type === 'bomb') {
                    setScore(prev => Math.max(0, prev - 5));
                    // Visual feedback could be added here
                } else {
                    setScore(prev => prev + (noodle.type === 'golden' ? 5 : 1));
                }
                noodlesRef.current.splice(index, 1);
            }
        });
    };

    return (
        <div className="min-h-screen bg-green-100 font-sans text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-green-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-50 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-green-700 mb-4 z-10 drop-shadow-sm">
                流しそうめん ゲーム
            </h1>

            {/* Score & Timer */}
            <div className="flex gap-8 mb-4 z-10">
                <div className="bg-white px-6 py-2 rounded-full shadow-lg border-2 border-green-500">
                    <span className="font-bold text-gray-500">スコア:</span>
                    <span className="text-2xl font-black text-green-600 ml-2">{score}</span>
                </div>
                <div className="bg-white px-6 py-2 rounded-full shadow-lg border-2 border-red-500">
                    <span className="font-bold text-gray-500">のこり:</span>
                    <span className="text-2xl font-black text-red-600 ml-2">{timeLeft}秒</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-green-800 bg-[#e6cfa1] max-w-full">
                <canvas
                    ref={canvasRef}
                    width={350}
                    height={600}
                    className="cursor-pointer touch-none max-w-full h-auto"
                    onMouseDown={handleCanvasClick}
                    onTouchStart={handleCanvasClick}
                />

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <p className="text-2xl font-bold mb-8">そうめんを タップして すくえ！</p>
                        <button
                            onClick={startGame}
                            className="bg-red-500 text-white px-8 py-4 rounded-full font-black text-2xl hover:bg-red-600 shadow-lg animate-bounce"
                        >
                            スタート！
                        </button>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
                        <p className="text-4xl font-black text-yellow-400 mb-4">しゅうりょう！</p>
                        <p className="text-2xl font-bold mb-8">あなたのスコア: {score}てん</p>
                        <button
                            onClick={startGame}
                            className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-green-600 shadow-lg"
                        >
                            もういちど
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-4 text-gray-600 font-bold">
                💣バクダンは さわっちゃダメだよ！
            </p>

        </div>
    );
}
