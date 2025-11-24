"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';

// --- Components ---

const Ship = ({ position, rotation }: { position: THREE.Vector3, rotation: THREE.Euler }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Body */}
            <mesh>
                <coneGeometry args={[0.5, 2, 4]} />
                <meshStandardMaterial color="cyan" />
            </mesh>
            {/* Wings */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.1, 3, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh>
        </group>
    );
};

const Ring = ({ position }: { position: [number, number, number] }) => {
    return (
        <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.2, 16, 32]} />
            <meshStandardMaterial color="gold" emissive="yellow" emissiveIntensity={0.5} />
        </mesh>
    );
};

const GameScene = ({ onScore }: { onScore: () => void }) => {
    const { camera } = useThree();
    const shipPos = useRef(new THREE.Vector3(0, 0, 0));
    const shipRot = useRef(new THREE.Euler(-Math.PI / 2, 0, 0)); // Pointing forward (-Z)
    const speed = useRef(0.5);
    const keys = useRef<{ [key: string]: boolean }>({});

    // Rings
    const rings = useRef([
        new THREE.Vector3(0, 0, -50),
        new THREE.Vector3(5, 5, -100),
        new THREE.Vector3(-5, -5, -150),
        new THREE.Vector3(10, 0, -200),
        new THREE.Vector3(0, 10, -250),
        new THREE.Vector3(-10, -5, -300),
        new THREE.Vector3(0, 0, -350),
    ]);

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
        // Movement Logic
        // Always move forward (-Z)
        shipPos.current.z -= speed.current;

        // Steer
        if (keys.current['ArrowUp']) shipPos.current.y += 0.2;
        if (keys.current['ArrowDown']) shipPos.current.y -= 0.2;
        if (keys.current['ArrowLeft']) shipPos.current.x -= 0.2;
        if (keys.current['ArrowRight']) shipPos.current.x += 0.2;

        // Camera Follow
        camera.position.x = shipPos.current.x;
        camera.position.y = shipPos.current.y + 2;
        camera.position.z = shipPos.current.z + 10;
        camera.lookAt(shipPos.current);

        // Check Ring Collision
        rings.current.forEach((ring, index) => {
            if (shipPos.current.distanceTo(ring) < 2) {
                // Hit!
                onScore();
                // Move ring far away to avoid re-trigger
                ring.set(0, 0, 1000);
                speed.current += 0.1; // Boost
            }
        });
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Ship position={shipPos.current} rotation={shipRot.current} />

            {rings.current.map((pos, i) => (
                <Ring key={i} position={[pos.x, pos.y, pos.z]} />
            ))}

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    );
};

export default function SkyGame() {
    const [score, setScore] = useState(0);

    return (
        <div className="w-full h-screen bg-black relative">
            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white/80 text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-white transition-colors">
                    ← もどる
                </Link>
            </div>

            <div className="absolute top-4 right-4 z-20 bg-white/80 px-6 py-2 rounded-full font-bold text-xl">
                SCORE: {score}
            </div>

            {/* Controls Hint */}
            <div className="absolute bottom-4 left-4 z-20 text-white bg-black/50 p-4 rounded-lg pointer-events-none">
                <p className="font-bold">そうさ ほうほう:</p>
                <p>矢印キー: いどう</p>
                <p>リングをくぐって 加速！</p>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
                <GameScene onScore={() => setScore(s => s + 1)} />
            </Canvas>

        </div>
    );
}
