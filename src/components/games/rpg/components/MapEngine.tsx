import React, { useEffect, useCallback } from 'react';
import { useRpgStore } from '../store';
import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../constants';
import { MAPS } from '../data/maps';
import { motion } from 'framer-motion';

// Colors for tiles
const TILE_COLORS: Record<number, string> = {
    0: 'bg-green-500', // Grass
    1: 'bg-green-800', // Tree (Wall)
    2: 'bg-blue-500',  // Water (Wall)
    3: 'bg-amber-700', // Town Icon (Walkable -> Event)
    4: 'bg-yellow-200', // Inn
    5: 'bg-orange-300', // Shop
    6: 'bg-slate-300', // Pavement
};

const TILE_ICONS: Record<number, string> = {
    1: '🌲',
    2: '🌊',
    3: '🏰',
    4: '🏨',
    5: '🛒',
};

const MapEngine = () => {
    const {
        currentMapId,
        playerPos,
        movePlayer,
        setMode,
        setPlayerPos,
        healParty,
        party
    } = useRpgStore();

    const currentMap = MAPS[currentMapId];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        let dx = 0;
        let dy = 0;
        let direction = playerPos.direction;

        if (e.key === 'ArrowUp' || e.key === 'w') { dy = -1; direction = 'up'; }
        if (e.key === 'ArrowDown' || e.key === 's') { dy = 1; direction = 'down'; }
        if (e.key === 'ArrowLeft' || e.key === 'a') { dx = -1; direction = 'left'; }
        if (e.key === 'ArrowRight' || e.key === 'd') { dx = 1; direction = 'right'; }

        if (dx === 0 && dy === 0) return;

        // Tentative new position
        const nextX = playerPos.x + dx;
        const nextY = playerPos.y + dy;

        // Map Bounds Check
        if (nextX < 0 || nextX >= currentMap.width || nextY < 0 || nextY >= currentMap.height) return;

        // Collision Check (Simple tile based)
        const tile = currentMap.tiles[nextY][nextX];
        const isWall = [1, 2].includes(tile); // 1=Tree, 2=Water

        // Update direction even if blocked
        setPlayerPos(playerPos.x, playerPos.y, direction);

        if (isWall) return;

        // Trigger Move
        movePlayer(dx, dy, currentMap.width, currentMap.height, {});

        // Event Check (Post-move) based on coordinate
        const event = currentMap.events.find(ev => ev.x === nextX && ev.y === nextY);
        if (event) {
            if (event.type === 'warp' && event.targetMapId) {
                useRpgStore.setState({ currentMapId: event.targetMapId });
                setPlayerPos(event.targetX || 0, event.targetY || 0, 'down');
                return; // Don't process encounter after warp
            }
            if (event.type === 'inn') {
                healParty();
                alert(event.message?.[1] || 'Recovered!');
            }
            if (event.type === 'shop') {
                // TODO: Open shop menu
                alert('Shop is not implemented yet!');
            }
        }

        // Encounter Check
        if (currentMap.encounterRate > 0 && Math.random() < currentMap.encounterRate) {
            setMode('battle');
        }

    }, [currentMap, movePlayer, playerPos, setPlayerPos, healParty, setMode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Viewport Calculation
    const viewportX = Math.max(0, Math.min(playerPos.x - Math.floor(VIEWPORT_WIDTH / 2), currentMap.width - VIEWPORT_WIDTH));
    const viewportY = Math.max(0, Math.min(playerPos.y - Math.floor(VIEWPORT_HEIGHT / 2), currentMap.height - VIEWPORT_HEIGHT));

    const visibleTiles = currentMap.tiles
        .slice(viewportY, viewportY + VIEWPORT_HEIGHT)
        .map(row => row.slice(viewportX, viewportX + VIEWPORT_WIDTH));

    return (
        <div className="relative bg-black border-4 border-white rounded-lg overflow-hidden shadow-2xl"
            style={{ width: VIEWPORT_WIDTH * TILE_SIZE, height: VIEWPORT_HEIGHT * TILE_SIZE }}>

            {/* Map Rendering */}
            <div className="grid gap-0"
                style={{
                    gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${TILE_SIZE}px)`,
                }}
            >
                {visibleTiles.map((row, y) => (
                    row.map((tile, x) => (
                        <div key={`${y}-${x}`} className={`relative w-[${TILE_SIZE}px] h-[${TILE_SIZE}px] ${TILE_COLORS[tile] || 'bg-black'} border-[0.5px] border-black/10 flex items-center justify-center text-xl`}>
                            {TILE_ICONS[tile]}
                        </div>
                    ))
                ))}
            </div>

            {/* Player Rendering */}
            <motion.div
                className="absolute w-10 h-10 flex items-center justify-center z-10"
                initial={false}
                animate={{
                    left: (playerPos.x - viewportX) * TILE_SIZE,
                    top: (playerPos.y - viewportY) * TILE_SIZE,
                }}
                transition={{ type: "tween", duration: 0.1 }}
            >
                <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white shadow-lg relative">
                    {/* Face direction */}
                    <div className={`absolute w-2 h-2 bg-black rounded-full ${playerPos.direction === 'up' ? 'top-1 left-1/2 -translate-x-1/2' :
                            playerPos.direction === 'down' ? 'bottom-2 left-1/2 -translate-x-1/2' :
                                playerPos.direction === 'left' ? 'left-1 top-1/2 -translate-y-1/2' :
                                    'right-1 top-1/2 -translate-y-1/2'
                        }`}></div>
                    <span className="absolute -top-4 w-20 text-center text-xs text-white font-bold drop-shadow-md left-1/2 -translate-x-1/2">
                        User
                    </span>
                </div>
            </motion.div>

            {/* UI Overlay */}
            <div className="absolute top-2 left-2 bg-black/50 text-white p-2 text-xs rounded">
                {currentMap.name} ({playerPos.x}, {playerPos.y})
            </div>
        </div>
    );
};

export default MapEngine;
