// ドラマ（スパイ・ガルーン等）のデータアクセス。
// 小説は別リポジトリ garoop-data から配信されるが、ドラマ脚本はこのリポジトリに
// 同梱した JSON を直接 import して使う（自己完結・追加が容易）。
// 新しいシリーズを増やすときは src/data/dramas/ に JSON を足し、ALL_DRAMAS に登録する。

import garuSpy from '@/data/dramas/garu-spy.json';

export type DramaPose =
  | 'idle'
  | 'jumping'
  | 'waving'
  | 'failed'
  | 'running-right'
  | 'running-left';

export type DramaLine = {
  type: 'action' | 'dialogue';
  text: string;
  char?: string;
  paren?: string;
  actor?: string;
  pose?: DramaPose;
};

export type DramaScene = {
  id: string;
  heading: string;
  lines: DramaLine[];
};

export type DramaEpisode = {
  number: number;
  title: string;
  subtitle?: string;
  runtime: number;
  synopsis: string;
  scenes: DramaScene[];
};

export type DramaCharacter = {
  id: string;
  name: string;
  animal: string;
  emoji: string;
  /** Hatch Pet スプライトのキー（あれば実アニメーションを使う） */
  sprite?: string;
  role: string;
  color: string;
  bio: string;
};

export type DramaSeries = {
  id: string;
  seriesTitle: string;
  enTitle?: string;
  genre: string;
  tagline: string;
  logline: string;
  accent: string;
  runtimePerEpisode: number;
  characters: DramaCharacter[];
  episodes: DramaEpisode[];
};

const ALL_DRAMAS = [garuSpy] as unknown as DramaSeries[];

export function getAllDramas(): DramaSeries[] {
  return ALL_DRAMAS;
}

export function getDramaById(id: string): DramaSeries | undefined {
  return ALL_DRAMAS.find((d) => d.id === id);
}

/** Hatch Pet スプライト（横ストリップ）のフレーム数。public/dramas/<sprite>/<pose>.png に対応。 */
export const SPRITE_FRAMES: Record<DramaPose, number> = {
  idle: 6,
  jumping: 5,
  waving: 4,
  'running-right': 8,
  'running-left': 8,
  failed: 8,
};

export const SPRITE_CELL = { width: 192, height: 208 };
