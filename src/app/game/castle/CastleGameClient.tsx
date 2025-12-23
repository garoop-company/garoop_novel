'use client';

import dynamic from 'next/dynamic';

const CastleGame = dynamic(() => import('@/components/games/CastleGame'), { ssr: false });

export default function CastleGameClient() {
    return <CastleGame />;
}
