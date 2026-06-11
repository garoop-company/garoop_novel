'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HatchPet } from '@/components/BabyHatchPet';
import { useHatchPetIndex } from './useHatchPets';
import {
  HATCH_PET_STATES,
  HATCH_PET_STATE_LABEL,
  type HatchPetIndexEntry,
  type HatchPetState,
} from '@/lib/hatch-pets';

/** index 由来のサムネ用に標準アトラス定数（8列x9行 / 192x208・idle=row0） */
const THUMB = { columns: 8, rows: 9, cellW: 192, cellH: 208 };

function PetThumb({ src, size = 62 }: { src: string; size?: number }) {
  const scale = size / THUMB.cellH;
  const cellW = THUMB.cellW * scale;
  const cellH = THUMB.cellH * scale;
  return (
    <div
      aria-hidden
      style={{
        width: cellW,
        height: cellH,
        backgroundImage: `url("${src}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${THUMB.columns * cellW}px ${THUMB.rows * cellH}px`,
        backgroundPosition: '0px 0px',
      }}
    />
  );
}

export default function HatchPetSelector({
  initialPets,
  defaultPetId,
}: {
  initialPets?: HatchPetIndexEntry[];
  defaultPetId?: string;
}) {
  const { pets, error, loading } = useHatchPetIndex(initialPets);
  const [selectedId, setSelectedId] = useState<string | null>(defaultPetId ?? null);
  const [state, setState] = useState<HatchPetState>('idle');

  // 一覧が来たら、未選択なら defaultPetId（無ければ先頭）を選ぶ
  useEffect(() => {
    if (!selectedId && pets && pets.length) {
      const fallback = pets.find((p) => p.id === defaultPetId)?.id ?? pets[0].id;
      setSelectedId(fallback);
    }
  }, [pets, selectedId, defaultPetId]);

  const selectedEntry = pets?.find((p) => p.id === selectedId) ?? null;

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6 text-rose-200 font-serif text-sm">
        ペットの読み込みに失敗しました：{error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ステージ */}
      <div
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(255,240,210,0.10), transparent 60%), linear-gradient(180deg, #120f1a 0%, #0a0810 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(217,180,120,0.16), 0 30px 60px -25px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* sprite */}
          <div className="relative grid place-items-center min-h-[200px] w-full">
            <div
              aria-hidden
              className="absolute bottom-3 w-32 h-4 rounded-[50%] blur-md"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            />
            {selectedId ? (
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HatchPet petId={selectedId} state={state} size={200} />
              </motion.div>
            ) : (
              <div className="text-amber-200/60 font-serif text-sm animate-pulse">
                {loading ? '読み込み中…' : 'ペットを選んでね'}
              </div>
            )}
          </div>

          {/* 名前・説明 */}
          <div className="text-center">
            <p className="font-serif text-xl text-amber-50">
              {selectedEntry?.japaneseName || selectedEntry?.displayName || ''}
            </p>
            {selectedEntry?.description && (
              <p className="mt-1 font-serif text-amber-50/65 text-[13px] leading-relaxed max-w-md mx-auto">
                {selectedEntry.description}
              </p>
            )}
          </div>

          {/* 状態切り替え */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {HATCH_PET_STATES.map((s) => {
              const active = s === state;
              return (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif border transition ${
                    active
                      ? 'bg-amber-300 text-stone-900 border-amber-200 shadow'
                      : 'bg-stone-900/50 text-amber-100/80 border-amber-200/15 hover:bg-stone-900/80'
                  }`}
                  title={s}
                >
                  {HATCH_PET_STATE_LABEL[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ペット一覧（選択） */}
      <div>
        <p className="font-serif text-amber-200/60 text-[11px] tracking-[0.3em] uppercase mb-3">
          ペットをえらぶ {pets ? `（${pets.length}匹）` : ''}
        </p>
        {loading && !pets ? (
          <div className="text-amber-200/50 font-serif text-sm py-6 text-center animate-pulse">
            一覧を読み込み中…
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
            {pets?.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setState('idle');
                  }}
                  className={`group flex flex-col items-center gap-1 rounded-2xl p-2.5 border transition ${
                    active
                      ? 'border-amber-300 bg-amber-300/10'
                      : 'border-amber-200/10 bg-stone-900/40 hover:bg-stone-900/70 hover:border-amber-200/25'
                  }`}
                >
                  <div className="h-16 grid place-items-end">
                    <PetThumb src={p.spritesheetUrl} size={62} />
                  </div>
                  <span className="font-serif text-[11px] text-amber-50/85 leading-tight text-center line-clamp-1">
                    {p.japaneseName || p.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
