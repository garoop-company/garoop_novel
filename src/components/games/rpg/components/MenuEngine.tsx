import React, { useState } from 'react';
import { useRpgStore } from '../store';
import { ITEMS } from '../data/items';

const MenuEngine = () => {
    const { party, gold, inventory, setMode, healParty } = useRpgStore();
    const [message, setMessage] = useState('');

    const handleSave = () => {
        // Simple serialization of the Zustand state
        const stateToSave = useRpgStore.getState();
        // Omit functions and circular refs if any (Immer state is clean usually)
        const saveData = {
            party: stateToSave.party,
            gold: stateToSave.gold,
            inventory: stateToSave.inventory,
            currentMapId: stateToSave.currentMapId,
            playerPos: stateToSave.playerPos,
        };

        localStorage.setItem('garoop_rpg_save', JSON.stringify(saveData));
        setMessage('セーブしました！');
        setTimeout(() => setMessage(''), 2000);
    };

    const handleLoad = () => {
        const saved = localStorage.getItem('garoop_rpg_save');
        if (saved) {
            const data = JSON.parse(saved);
            // We need to carefully rehydrate. For MVP, we'll brute force properties.
            useRpgStore.setState(data);
            setMessage('ロードしました！');
            setTimeout(() => setMessage(''), 2000);
        } else {
            setMessage('セーブデータがありません');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    return (
        <div className="w-full h-full bg-slate-900 text-white p-6 font-mono flex gap-6">

            {/* Left Column: Command */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="border border-white/50 p-4 rounded bg-slate-800">
                    <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-gray-600 pb-2">MENU</h2>
                    <ul className="space-y-2 text-lg">
                        <li className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded">つよさ (Status)</li>
                        <li className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded">どうぐ (Items)</li>
                        <li className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded">そうび (Equip)</li>
                        <li onClick={handleSave} className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded">セーブ (Save)</li>
                        {/* <li onClick={handleLoad} className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded">ロード (Load)</li> */}
                        <li onClick={() => setMode('map')} className="cursor-pointer hover:text-yellow-300 hover:bg-white/10 p-1 rounded border-t border-gray-600 mt-2 pt-2">とじる (Close)</li>
                    </ul>
                </div>

                <div className="border border-white/50 p-4 rounded bg-slate-800">
                    <div className="flex justify-between text-yellow-500 font-bold mb-2">
                        <span>GOLD</span>
                        <span>{gold} G</span>
                    </div>
                    {message && (
                        <div className="text-center text-green-400 animate-bounce">
                            {message}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Status / Detail */}
            <div className="flex-1 border border-white/50 p-4 rounded bg-slate-800 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4 text-blue-300 border-b border-gray-600 pb-2">PARTY STATUS</h3>
                <div className="grid gap-4">
                    {party.map((char, i) => (
                        <div key={i} className="flex bg-slate-700/50 p-3 rounded items-center gap-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg">{char.name}</span>
                                    <span className="text-yellow-500">Lv.{char.level}</span>
                                </div>
                                <div className="text-sm text-gray-300">{char.job.toUpperCase()}</div>
                                <div className="mt-1 grid grid-cols-2 gap-x-4 text-sm">
                                    <div className="flex justify-between">
                                        <span>HP</span>
                                        <span className={char.hp < char.maxHp / 3 ? 'text-red-400' : 'text-white'}>{char.hp}/{char.maxHp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>MP</span>
                                        <span>{char.mp}/{char.maxMp}</span>
                                    </div>
                                    <div className="col-span-2 mt-1 bg-gray-700 h-1 rounded overflow-hidden">
                                        <div className="bg-orange-400 h-full" style={{ width: `${(char.exp / char.nextExp) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2 text-green-300 border-b border-gray-600 pb-2">INVENTORY</h3>
                    {inventory.length === 0 ? (
                        <p className="text-gray-500">もちもの は ありません</p>
                    ) : (
                        <ul className="space-y-1">
                            {inventory.map((slot, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>{slot.item.name}</span>
                                    <span>x{slot.count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MenuEngine;
