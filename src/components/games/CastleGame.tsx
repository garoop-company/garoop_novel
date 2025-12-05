"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';

// --- Components ---

const Player = ({ position, setPosition, touchControls }: { position: THREE.Vector3, setPosition: (pos: THREE.Vector3) => void, touchControls: { forward: boolean, backward: boolean, left: boolean, right: boolean } }) => {
    const { camera } = useThree();
    const moveSpeed = 0.1;
    const keys = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame(() => {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));

        if (keys.current['ArrowUp'] || keys.current['KeyW'] || touchControls.forward) {
            camera.position.addScaledVector(direction, moveSpeed);
        }
        if (keys.current['ArrowDown'] || keys.current['KeyS'] || touchControls.backward) {
            camera.position.addScaledVector(direction, -moveSpeed);
        }
        if (keys.current['ArrowLeft'] || keys.current['KeyA'] || touchControls.left) {
            camera.position.addScaledVector(right, -moveSpeed);
        }
        if (keys.current['ArrowRight'] || keys.current['KeyD'] || touchControls.right) {
            camera.position.addScaledVector(right, moveSpeed);
        }

        // Simple boundary check
        camera.position.x = Math.max(-14, Math.min(14, camera.position.x));
        camera.position.z = Math.max(-14, Math.min(14, camera.position.z));
        camera.position.y = 1.5; // Eye level

        setPosition(camera.position.clone());
    });

    return null;
};

const Wall = ({ position, rotation = [0, 0, 0], size = [1, 3, 1] }: { position: [number, number, number], rotation?: [number, number, number], size?: [number, number, number] }) => {
    return (
        <Box position={position} rotation={rotation} args={size}>
            <meshStandardMaterial color="#8b5a2b" />
        </Box>
    );
};

const Torch = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            <pointLight intensity={5} distance={5} color="orange" decay={2} />
            <mesh>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        </group>
    );
};

const KingGaroop = ({ position }: { position: [number, number, number] }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Body */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.5]} />
                <meshStandardMaterial color="pink" />
            </mesh>
            {/* Crown */}
            <mesh position={[0, 1, 0]}>
                <coneGeometry args={[0.3, 0.5, 4]} />
                <meshStandardMaterial color="gold" />
            </mesh>
            {/* Text */}
            <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                おうさま
            </Text>
        </group>
    );
};

const CastleScene = ({ onWin, touchControls }: { onWin: () => void, touchControls: { forward: boolean, backward: boolean, left: boolean, right: boolean } }) => {
    const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1.5, 10));

    useFrame(() => {
        // Check win condition (Near King)
        if (playerPos.distanceTo(new THREE.Vector3(0, 0, -10)) < 3) {
            onWin();
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <Player position={playerPos} setPosition={setPlayerPos} touchControls={touchControls} />

            {/* Floor */}
            <Plane rotation={[-Math.PI / 2, 0, 0]} args={[30, 30]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#333" />
            </Plane>

            {/* Ceiling */}
            <Plane rotation={[Math.PI / 2, 0, 0]} args={[30, 30]} position={[0, 3, 0]}>
                <meshStandardMaterial color="#222" />
            </Plane>

            {/* Outer Walls */}
            <Wall position={[0, 1.5, -15]} size={[30, 3, 1]} />
            <Wall position={[0, 1.5, 15]} size={[30, 3, 1]} />
            <Wall position={[-15, 1.5, 0]} size={[1, 3, 30]} />
            <Wall position={[15, 1.5, 0]} size={[1, 3, 30]} />

            {/* Maze Walls */}
            <Wall position={[-5, 1.5, 5]} size={[10, 3, 1]} />
            <Wall position={[5, 1.5, -5]} size={[10, 3, 1]} />
            <Wall position={[0, 1.5, 0]} size={[1, 3, 10]} />

            {/* Torches */}
            <Torch position={[-10, 2, 10]} />
            <Torch position={[10, 2, 10]} />
            <Torch position={[-10, 2, -10]} />
            <Torch position={[10, 2, -10]} />
            <Torch position={[0, 2, 0]} />

            {/* King */}
            <KingGaroop position={[0, 0, -12]} />
        </>
    );
};

export default function CastleGame() {
    const [gameWon, setGameWon] = useState(false);
    const [touchControls, setTouchControls] = useState({ forward: false, backward: false, left: false, right: false });

    const handleTouchStart = (direction: 'forward' | 'backward' | 'left' | 'right') => {
        setTouchControls(prev => ({ ...prev, [direction]: true }));
    };

    const handleTouchEnd = (direction: 'forward' | 'backward' | 'left' | 'right') => {
        setTouchControls(prev => ({ ...prev, [direction]: false }));
    };

    return (
        <div className="w-full h-screen bg-black relative touch-none">
            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white/80 text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-white transition-colors">
                    ← もどる
                </Link>
            </div>

            {/* Controls Hint */}
            <div className="absolute top-4 right-4 z-20 text-white bg-black/50 p-4 rounded-lg pointer-events-none text-xs md:text-base max-w-[200px] md:max-w-none">
                <p className="font-bold">そうさ ほうほう:</p>
                <p>マウス/スワイプ: してん いどう</p>
                <p>キーボード/ボタン: いどう</p>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 1.5, 10], fov: 75 }}>
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
                <CastleScene onWin={() => setGameWon(true)} touchControls={touchControls} />
            </Canvas>

            {/* Mobile Controls (D-Pad) */}
            <div className="absolute bottom-8 left-8 z-20 w-40 h-40 md:hidden">
                <button
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full active:bg-white/60 backdrop-blur-sm border border-white/50"
                    onTouchStart={() => handleTouchStart('forward')}
                    onTouchEnd={() => handleTouchEnd('forward')}
                    onMouseDown={() => handleTouchStart('forward')}
                    onMouseUp={() => handleTouchEnd('forward')}
                >
                    ⬆️
                </button>
                <button
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full active:bg-white/60 backdrop-blur-sm border border-white/50"
                    onTouchStart={() => handleTouchStart('backward')}
                    onTouchEnd={() => handleTouchEnd('backward')}
                    onMouseDown={() => handleTouchStart('backward')}
                    onMouseUp={() => handleTouchEnd('backward')}
                >
                    ⬇️
                </button>
                <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full active:bg-white/60 backdrop-blur-sm border border-white/50"
                    onTouchStart={() => handleTouchStart('left')}
                    onTouchEnd={() => handleTouchEnd('left')}
                    onMouseDown={() => handleTouchStart('left')}
                    onMouseUp={() => handleTouchEnd('left')}
                >
                    ⬅️
                </button>
                <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full active:bg-white/60 backdrop-blur-sm border border-white/50"
                    onTouchStart={() => handleTouchStart('right')}
                    onTouchEnd={() => handleTouchEnd('right')}
                    onMouseDown={() => handleTouchStart('right')}
                    onMouseUp={() => handleTouchEnd('right')}
                >
                    ➡️
                </button>
            </div>

            {/* Win Overlay */}
            {gameWon && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30">
                    <h1 className="text-3xl md:text-5xl font-black text-yellow-400 mb-4">おうさまに あえた！</h1>
                    <p className="text-xl md:text-2xl mb-8">おめでとう！</p>
                    <Link href="/game" className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 shadow-lg">
                        ゲームいちらんへ
                    </Link>
                </div>
            )}
        </div>
    );
}
