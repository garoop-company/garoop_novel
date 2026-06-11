'use client';

import { useEffect, useState } from 'react';
import {
  HATCH_PETS_INDEX_PATH,
  resolveDataUrl,
  type HatchPetIndexEntry,
} from '@/lib/hatch-pets';
import { dataUrl } from '@/lib/data-source';

// garoop-data の hatch-pets/index.json はCORS全開放（access-control-allow-origin: *）
// なので、クライアントから直接 fetch できる（プロキシ不要）。
export function useHatchPetIndex(initial?: HatchPetIndexEntry[]) {
  const [pets, setPets] = useState<HatchPetIndexEntry[] | null>(
    initial && initial.length ? initial : null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial && initial.length) return; // SSR で渡されていれば再取得不要
    let alive = true;
    fetch(dataUrl(HATCH_PETS_INDEX_PATH))
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (Array.isArray(d?.pets)) {
          setPets(
            (d.pets as HatchPetIndexEntry[]).map((p) => ({
              ...p,
              spritesheetUrl: resolveDataUrl(p.spritesheetUrl),
            }))
          );
        } else setError('invalid index');
      })
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [initial]);

  return { pets, error, loading: pets === null && !error };
}
