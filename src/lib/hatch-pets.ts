// Hatch Pet（Codex互換アニメーション・ペット）一覧データへのアクセス。
// 公開データは garoop-data（https://garoop-data.vercel.app, CORS全開放）配信:
//   一覧:   /hatch-pets/index.json
//   ペット: /hatch-pets/<id>/pet.json
//   画像:   /hatch-pets/<id>/spritesheet.webp  （8列 x 9行 / 基本セル 192x208）
// スプライト描画は <BabyHatchPet petId state /> （= HatchPet）が pet.json を
// 自己取得して atlas/rows から background-position でアニメーションする。
// この lib は「一覧（index.json）」の型と取得ヘルパのみを担う。

import { dataUrl, fetchJson } from './data-source';

export const HATCH_PET_STATES = [
  'idle',
  'running-right',
  'running-left',
  'waving',
  'jumping',
  'failed',
  'waiting',
  'running',
  'review',
] as const;

export type HatchPetState = (typeof HATCH_PET_STATES)[number];

/** 各状態の表示用ラベル（日本語） */
export const HATCH_PET_STATE_LABEL: Record<HatchPetState, string> = {
  idle: '待機',
  'running-right': '右へ走る',
  'running-left': '左へ走る',
  waving: '手をふる',
  jumping: 'ジャンプ',
  failed: 'しょんぼり',
  waiting: 'まちわび',
  running: 'おしごと',
  review: 'できた！',
};

/** index.json の各エントリ */
export type HatchPetIndexEntry = {
  id: string;
  displayName: string;
  japaneseName?: string;
  description?: string;
  petUrl: string;
  spritesheetUrl: string; // 絶対URLに解決して使う
};

export const HATCH_PETS_INDEX_PATH = '/hatch-pets/index.json';

/** CDN ルート相対 or 絶対 を絶対URLに解決 */
export function resolveDataUrl(p: string): string {
  if (!p) return p;
  return /^https?:\/\//.test(p) ? p : dataUrl(p);
}

type RawIndex = { count?: number; pets?: HatchPetIndexEntry[] };

/** 一覧を取得（spritesheetUrl を絶対URL化して返す）— SSR 先読み用 */
export async function fetchHatchPetIndex(): Promise<HatchPetIndexEntry[]> {
  const data = await fetchJson<RawIndex>(HATCH_PETS_INDEX_PATH);
  const pets = Array.isArray(data.pets) ? data.pets : [];
  return pets.map((p) => ({ ...p, spritesheetUrl: resolveDataUrl(p.spritesheetUrl) }));
}
