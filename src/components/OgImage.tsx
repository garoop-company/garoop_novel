'use client';

import { useState } from 'react';

/* The OGP image of a link card. Hidden when the image host refuses it (some block hotlinking). */
export default function OgImage({ src, className }: { src: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    if (failed) return null;
    return (
        // eslint-disable-next-line @next/next/no-img-element -- external OGP images; next/image would need every host allowed
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className={className} onError={() => setFailed(true)} />
    );
}
