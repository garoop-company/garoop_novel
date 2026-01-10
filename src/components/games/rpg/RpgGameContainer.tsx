import React from 'react';
import { useRpgStore } from './store';
import MenuEngine from './components/MenuEngine';
import { AnimatePresence, motion } from 'framer-motion';
import BattleEngine from './components/BattleEngine';
import MapEngine from './components/MapEngine';

const RpgGameContainer = () => {
    const { mode, setMode } = useRpgStore();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'm' || e.key === 'Escape') {
                if (mode === 'map') setMode('menu');
                else if (mode === 'menu') setMode('map');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, setMode]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-md">
                Role Playing Game
            </h1>

            {/* Main Viewport */}
            <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden border-4 border-slate-600 shadow-2xl">
                <AnimatePresence mode="wait">
                    {mode === 'title' && (
                        <motion.div
                            key="title"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white"
                        >
                            <h2 className="text-5xl font-black text-yellow-500 mb-8">LEGEND OF GAROOP</h2>
                            <button
                                onClick={() => setMode('map')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-500 transition shadow-lg"
                            >
                                NEW GAME
                            </button>
                            <button
                                onClick={() => {
                                    const saved = localStorage.getItem('garoop_rpg_save');
                                    if (saved) {
                                        useRpgStore.setState(JSON.parse(saved));
                                        useRpgStore.getState().setMode('map');
                                    } else {
                                        alert('No save data found.');
                                    }
                                }}
                                className="mt-4 text-gray-400 hover:text-white underline text-sm"
                            >
                                CONTINUE FROM SAVE
                            </button>
                        </motion.div>
                    )}

                    {mode === 'map' && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-full h-full flex items-center justify-center bg-black"
                        >
                            <MapEngine />
                        </motion.div>
                    )}

                    {mode === 'battle' && (
                        <motion.div
                            key="battle"
                            initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-full h-full bg-slate-800"
                        >
                            <BattleEngine />
                        </motion.div>
                    )}

                    {mode === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-full h-full z-20"
                        >
                            <MenuEngine />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Debug / Status Bar */}
            <div className="mt-4 w-full max-w-2xl bg-slate-800 text-white p-4 rounded border border-slate-600 flex justify-between">
                <div>State: {mode}</div>
                <div className="text-xs text-gray-400">Controls: Arrow Keys to Move, [M] for Menu</div>
            </div>
        </div>
    );
};

export default RpgGameContainer;
