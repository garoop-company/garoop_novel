import { defineConfig, devices } from "@playwright/test";

// E2E は本番ビルドを `next start -p 3102` で起動して実ブラウザで確認する。
// 3102 固定（他リポジトリが 3101, 3103〜3106 を並行で使うため）。
const PORT = 3102;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "ja-JP",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 740 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: BASE_URL + "/ja",
    reuseExistingServer: false,
    timeout: 600_000,
    stdout: "ignore",
    stderr: "pipe",
    // 小説は現在 19 冊で既定の 24 冊/ページだと 1 ページに収まるため、E2E では 8 冊/ページにしてページ送りを確かめる
    // RECAPTCHA_SECRET は空にして、E2E 中にサーバーから Google へ問い合わせないようにする
    // （判定ロジックは e2e/recaptcha-api.spec.ts で fetch を差し替えて確かめる）
    env: { NOVELS_PAGE_SIZE: "8", RECAPTCHA_SECRET: "" },
  },
});
