import { test as base, expect, type Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────
// 外部 API のモック。本番 API への書き込みは絶対に起こさない。
//   - api.garoop.jp/query（GraphQL）: クエリ名で固定データを返す。mutation 等は空応答。
//   - data.garoop.jp/hatch-pets/<id>/pet.json & spritesheet: 固定データ／1x1 PNG。
//   - それ以外の外部ホストへの GET 以外のリクエストは遮断する。
// ─────────────────────────────────────────────────────────────

export type MockBaby = {
  id: string;
  name: string;
  animalType: string;
  personality: string | null;
  description: string | null;
  avatarUrl: string | null;
  growthLevel: number;
};

export const hatchAvatar = (petId: string) => `https://data.garoop.jp/hatch-pets/${petId}/spritesheet.webp`;

export const MY_BABY: MockBaby = {
  id: "my-1",
  name: "ぴよ",
  animalType: "kangaroo",
  personality: null,
  description: null,
  avatarUrl: hatchAvatar("e2e-mine"),
  growthLevel: 12,
};

export const PUBLIC_BABIES: MockBaby[] = ["a", "b", "c", "d"].map((k, i) => ({
  id: `pub-${k}`,
  name: `みんな${i + 1}`,
  animalType: "cat",
  personality: null,
  description: null,
  avatarUrl: hatchAvatar(`e2e-pub-${k}`),
  growthLevel: 20,
}));

export const LOGIN_USER = { id: "u-e2e", name: "テスト", iconPath: "", planType: "free" };

// 1x1 透明 PNG
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

function petJson(id: string) {
  return {
    id,
    displayName: id,
    japaneseName: `ペット-${id}`,
    spritesheetUrl: `/hatch-pets/${id}/spritesheet.webp`,
    atlas: { columns: 8, rows: 9, cellWidth: 192, cellHeight: 208, width: 1536, height: 1872 },
    rows: [
      { state: "idle", row: 0, frames: 6 },
      { state: "waving", row: 3, frames: 4 },
      { state: "running-right", row: 1, frames: 8 },
      { state: "running-left", row: 2, frames: 8 },
    ],
  };
}

export type MockOptions = { loggedIn: boolean; myBabies: MockBaby[]; publicBabies: MockBaby[] };

export async function installMocks(page: Page, opts: MockOptions) {
  // 外部ホストへの書き込み系リクエストは遮断（GET はそのまま通す）。
  // Playwright は後から登録した route が先に評価されるので、この catch-all を最初に登録する。
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, async (route) => {
    if (route.request().method() !== "GET") return route.abort();
    return route.fallback();
  });

  await page.route("https://api.garoop.jp/**", async (route) => {
    const req = route.request();
    const cors = {
      "access-control-allow-origin": req.headers()["origin"] ?? "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-headers": "content-type, x-recaptcha-token",
      "access-control-allow-methods": "POST, GET, OPTIONS",
    };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    let query = "";
    try { query = (req.postDataJSON() as { query?: string } | null)?.query ?? ""; } catch { /* not json */ }
    let data: Record<string, unknown> = {};
    if (/^\s*query\s*\{\s*getLoginUser/.test(query)) data = { getLoginUser: opts.loggedIn ? LOGIN_USER : null };
    else if (/^\s*query\s*\{\s*getMyBabies/.test(query)) data = { getMyBabies: opts.loggedIn ? opts.myBabies : [] };
    else if (/^\s*query\s*\{\s*getPublicBabies/.test(query)) data = { getPublicBabies: opts.publicBabies };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: cors,
      body: JSON.stringify({ data }),
    });
  });

  await page.route(/https:\/\/data\.garoop\.jp\/hatch-pets\/(e2e-[^/]+)\/(pet\.json|spritesheet\.webp)$/, async (route) => {
    const m = route.request().url().match(/hatch-pets\/([^/]+)\/(pet\.json|spritesheet\.webp)$/)!;
    if (m[2] === "pet.json") {
      await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(petJson(m[1])) });
    } else {
      await route.fulfill({ status: 200, contentType: "image/png", body: PNG_1PX });
    }
  });

  if (opts.loggedIn) {
    await page.addInitScript(() => {
      sessionStorage.setItem("isLogin", "true");
      sessionStorage.setItem("garoopLoginUserId", "u-e2e");
    });
  }
}

/** ページのコンソールエラー・未捕捉例外を集める */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // モックで遮断した外部リクエストの失敗はアプリの不具合ではない
    if (/net::ERR_FAILED|ERR_BLOCKED_BY_CLIENT/.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

type Fixtures = { mockOptions: MockOptions; errors: string[] };

export const test = base.extend<Fixtures>({
  mockOptions: [{ loggedIn: false, myBabies: [], publicBabies: [] }, { option: true }],
  errors: async ({ page }, provide) => {
    await provide(collectErrors(page));
  },
  page: async ({ page, mockOptions }, provide) => {
    await installMocks(page, mockOptions);
    await provide(page);
  },
});

/** 要素の background-position を一定間隔で取り、変化した回数を数える */
export async function samplePositions(page: Page, selector: string, durationMs: number, intervalMs = 120) {
  return page.evaluate(
    async ({ selector, durationMs, intervalMs }) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const series: string[][] = els.map(() => []);
      const end = performance.now() + durationMs;
      while (performance.now() < end) {
        els.forEach((el, i) => series[i].push(getComputedStyle(el).backgroundPosition));
        await new Promise((r) => setTimeout(r, intervalMs));
      }
      return els.map((el, i) => ({
        label: el.getAttribute("aria-label") ?? "",
        distinct: new Set(series[i]).size,
      }));
    },
    { selector, durationMs, intervalMs },
  );
}

export { expect };
