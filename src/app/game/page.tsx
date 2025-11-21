"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// Game definitions
const GAMES = [
  {
    id: 'puzzle',
    title: 'パズル',
    description: 'いろんな えあわせ パズルだよ！',
    image: '/images/games/puzzle/shipbuilding.png',
    color: 'bg-blue-400',
    url: '/game/puzzle'
  },
  {
    id: 'poker',
    title: 'ポーカー',
    description: 'みんなで ポーカー しよう！',
    image: '/images/garoop_thinking.png', // Use generic garoop for now
    color: 'bg-green-500',
    url: '/game/poker'
  },
  {
    id: 'card',
    title: 'カードバトル',
    description: 'ガルちゃん カードで バトルだ！',
    image: '/images/garoop_battle.png', // Use battle garoop
    color: 'bg-red-400',
    url: '/game/card'
  },
  {
    id: 'shooter',
    title: 'シューティング',
    description: 'バンバン うって てきを たおせ！',
    image: '/images/games/shooter/garoop_shooter.png',
    color: 'bg-purple-400',
    url: '/game/shooter'
  },
  {
    id: 'mystery',
    title: '名探偵ガルちゃん',
    description: 'じけんを かいけつ しよう！',
    image: '/images/garoop_thinking.png',
    color: 'bg-indigo-500',
    url: '/game/mystery'
  },
  {
    id: 'escape',
    title: '脱出ゲーム',
    description: 'へやから だっしゅつ せよ！',
    image: '/images/garoop_happy.png',
    color: 'bg-teal-500',
    url: '/game/escape'
  },
  {
    id: 'rpg',
    title: 'ガルちゃんの冒険',
    description: 'バズり魔王を たおせ！',
    image: '/images/garoop_battle.png',
    color: 'bg-pink-500',
    url: '/game/rpg'
  }
];

export default function GameHub() {
  return (
    <div className="min-h-screen bg-yellow-100 font-sans">
      {/* Header */}
      <header className="bg-orange-400 p-4 shadow-lg border-b-4 border-orange-600">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md tracking-wider">
            ガルちゃん ゲームランド
          </h1>
          <Link href="/" className="bg-white text-orange-500 px-4 py-2 rounded-full font-bold hover:bg-orange-100 transition-colors border-2 border-orange-500">
            もどる
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12 gap-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-48 h-48 relative"
          >
            {/* Using generated happy garoop */}
            {/* Note: In a real scenario, I'd move the artifact image to public/images. For now, assuming it's there or I'll use a placeholder if the copy step wasn't done yet. 
                 I will use the artifact path logic in my head: I need to copy them. 
                 For this code, I will point to where I WILL put them. */}
            <Image
              src="/images/garoop_happy.png"
              alt="Garoop Happy"
              fill
              className="object-contain drop-shadow-xl"
            />
          </motion.div>
          <div className="text-center md:text-left bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-400 max-w-lg">
            <p className="text-xl md:text-2xl text-gray-700 font-bold leading-relaxed">
              やあ！ ぼく ガルちゃん！<br />
              いっしょに ゲームで あそぼうよ！<br />
              すきな ゲームを えらんでね！
            </p>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={game.url} className="block h-full">
                <div className={`h-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border-4 border-white ${game.color}`}>
                  <div className="h-40 relative bg-white/30 overflow-hidden flex items-center justify-center">
                    {/* Thumbnail */}
                    {game.image.includes('placeholder') ? (
                      <div className="text-6xl">🎮</div>
                    ) : (
                      <Image
                        src={game.image}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4 text-center text-white">
                    <h2 className="text-2xl font-black mb-2 drop-shadow-md">{game.title}</h2>
                    <p className="font-bold text-sm opacity-90">{game.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-orange-300 p-6 mt-12 text-center text-white font-bold">
        &copy; Garoop Novel Game Hub
      </footer>
    </div>
  );
}
