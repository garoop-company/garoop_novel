"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Constants ---
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 50;
const ENEMY_SIZE = 40;
const BULLET_SIZE = 10;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED_BASE = 2;
const SPAWN_RATE = 1000; // ms

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string; // for enemies: zombie, monster, animal
    emoji?: string;
}

export default function ShooterGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Game State Refs (for loop)
    const playerRef = useRef<GameObject>({ x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - PLAYER_SIZE - 10, width: PLAYER_SIZE, height: PLAYER_SIZE });
    const bulletsRef = useRef<GameObject[]>([]);
    const enemiesRef = useRef<GameObject[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const frameRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const scoreRef = useRef(0); // Ref for loop access

    // Images
    const playerImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        // Load Player Image
        const img = new Image();
        img.src = '/images/games/shooter/garoop_shooter.png';
        playerImageRef.current = img;

        // Input Listeners
        const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.key] = true;
        const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        scoreRef.current = 0;

        // Reset State
        playerRef.current = { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - PLAYER_SIZE - 10, width: PLAYER_SIZE, height: PLAYER_SIZE };
        bulletsRef.current = [];
        enemiesRef.current = [];
        lastSpawnRef.current = Date.now();

        gameLoop();
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Update
        update();

        // Draw
        draw(ctx);

        if (!gameOver) {
            frameRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const update = () => {
        // Player Movement
        if (keysRef.current['ArrowLeft'] && playerRef.current.x > 0) {
            playerRef.current.x -= PLAYER_SPEED;
        }
        if (keysRef.current['ArrowRight'] && playerRef.current.x < CANVAS_WIDTH - PLAYER_SIZE) {
            playerRef.current.x += PLAYER_SPEED;
        }

        // Shooting (Spacebar)
        if (keysRef.current[' '] && frameRef.current % 10 === 0) { // Limit fire rate
            bulletsRef.current.push({
                x: playerRef.current.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2,
                y: playerRef.current.y,
                width: BULLET_SIZE,
                height: BULLET_SIZE
            });
        }

        // Bullets
        bulletsRef.current.forEach(b => b.y -= BULLET_SPEED);
        bulletsRef.current = bulletsRef.current.filter(b => b.y > -BULLET_SIZE);

        // Enemies Spawning
        if (Date.now() - lastSpawnRef.current > SPAWN_RATE) {
            const types = [
                { type: 'zombie', emoji: '🧟' },
                { type: 'monster', emoji: '👾' },
                { type: 'animal', emoji: '🦁' }
            ];
            const randomType = types[Math.floor(Math.random() * types.length)];

            enemiesRef.current.push({
                x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
                y: -ENEMY_SIZE,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                ...randomType
            });
            lastSpawnRef.current = Date.now();
        }

        // Enemies Movement
        enemiesRef.current.forEach(e => e.y += ENEMY_SPEED_BASE + (scoreRef.current / 100)); // Speed up with score

        // Collisions
        // Bullet vs Enemy
        bulletsRef.current.forEach((b, bIdx) => {
            enemiesRef.current.forEach((e, eIdx) => {
                if (checkCollision(b, e)) {
                    // Hit!
                    bulletsRef.current.splice(bIdx, 1);
                    enemiesRef.current.splice(eIdx, 1);
                    scoreRef.current += 10;
                    setScore(scoreRef.current);
                }
            });
        });

        // Enemy vs Player (Game Over)
        enemiesRef.current.forEach(e => {
            if (checkCollision(e, playerRef.current) || e.y > CANVAS_HEIGHT) {
                if (checkCollision(e, playerRef.current)) {
                    setGameOver(true);
                }
                // Remove if off screen
                if (e.y > CANVAS_HEIGHT) {
                    // Maybe penalize score or lives? For now just remove.
                    const idx = enemiesRef.current.indexOf(e);
                    if (idx > -1) enemiesRef.current.splice(idx, 1);
                }
            }
        });
    };

    const checkCollision = (rect1: GameObject, rect2: GameObject) => {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear
        ctx.fillStyle = '#1a1a2e'; // Dark blue background
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Player
        if (playerImageRef.current) {
            ctx.drawImage(playerImageRef.current, playerRef.current.x, playerRef.current.y, PLAYER_SIZE, PLAYER_SIZE);
        } else {
            ctx.fillStyle = 'cyan';
            ctx.fillRect(playerRef.current.x, playerRef.current.y, PLAYER_SIZE, PLAYER_SIZE);
        }

        // Draw Bullets
        ctx.fillStyle = 'yellow';
        bulletsRef.current.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Enemies
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        enemiesRef.current.forEach(e => {
            ctx.fillText(e.emoji || '👾', e.x + e.width / 2, e.y + e.height / 2);
        });
    };

    // Touch Controls for Mobile
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;

        // Center player on touch
        playerRef.current.x = touchX - PLAYER_SIZE / 2;

        // Clamp
        if (playerRef.current.x < 0) playerRef.current.x = 0;
        if (playerRef.current.x > CANVAS_WIDTH - PLAYER_SIZE) playerRef.current.x = CANVAS_WIDTH - PLAYER_SIZE;
    };

    const handleTouchStart = () => {
        // Auto fire on touch? Or tap to fire?
        // Let's make tap to fire
        bulletsRef.current.push({
            x: playerRef.current.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2,
            y: playerRef.current.y,
            width: BULLET_SIZE,
            height: BULLET_SIZE
        });
    };

    return (
        <div className="min-h-screen bg-purple-900 p-4 font-sans text-white flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-4">
                <Link href="/game" className="bg-white text-purple-900 px-4 py-2 rounded-full font-bold hover:bg-purple-100">
                    ← もどる
                </Link>
                <h1 className="text-2xl font-bold text-yellow-400">シューティング</h1>
                <div className="w-20"></div>
            </div>

            {/* Game Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-500">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="bg-gray-900 block touch-none"
                    onTouchMove={handleTouchMove}
                    onTouchStart={handleTouchStart}
                />

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 text-xl font-bold text-white drop-shadow-md">
                    SCORE: {score}
                </div>

                {/* Start / Game Over Screen */}
                {(!gameStarted || gameOver) && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                        {gameOver && (
                            <div className="mb-6">
                                <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
                                <p className="text-2xl text-white">スコア: {score}</p>
                            </div>
                        )}

                        {!gameStarted && (
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-yellow-400 mb-4">あそびかた</h2>
                                <p className="text-gray-300 mb-2">PC: ← → で いどう、スペース で はっしゃ</p>
                                <p className="text-gray-300">スマホ: タッチ で いどう ＆ はっしゃ</p>
                            </div>
                        )}

                        <button
                            onClick={startGame}
                            className="bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-4 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            {gameOver ? 'もういちど やる' : 'ゲーム スタート'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
