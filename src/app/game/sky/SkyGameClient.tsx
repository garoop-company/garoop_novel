'use client';

import dynamic from 'next/dynamic';

const SkyGame = dynamic(() => import('@/components/games/SkyGame'), { ssr: false });

export default function SkyGameClient() {
    return <SkyGame />;
}
