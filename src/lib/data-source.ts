// garoop-data 公開 JSON への参照ヘルパ。
// データ本体は別リポジトリ（garoop-data）の public/ 以下にあり、
// Vercel ホスティング `https://garoop-data.vercel.app/` から配信される。
// 環境変数 GAROOP_DATA_BASE_URL で上書き可能（ローカル開発で別ホストを向ける用途）。

const BASE = (process.env.GAROOP_DATA_BASE_URL ?? 'https://garoop-data.vercel.app').replace(/\/$/, '');

export function dataUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

export async function fetchJson<T>(path: string, init?: { revalidate?: number | false }): Promise<T> {
  const url = dataUrl(path);
  const revalidate = init?.revalidate ?? 3600; // 1h ISR by default
  const res = await fetch(url, {
    next: revalidate === false ? undefined : { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// 小説関連のパス。chapterFile は novels.json 側に書かれているファイル名のみ。
export const NOVELS_INDEX_PATH = '/novel/novels.json';
export const VIDEOS_INDEX_PATH = '/novel/videos.json';
export const chapterPath = (chapterFile: string) => `/novel/chapters/${chapterFile}`;
