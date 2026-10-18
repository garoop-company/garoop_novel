import { test, expect } from "./fixtures";

// PWA（public/sw.js + RegisterServiceWorker）が本番ビルドで動くこと
test.describe("Service Worker", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "ブラウザの挙動は画面幅に依らないので 1 回だけ確認する");
  });

  test("sw.js・offline.html・manifest が正しく配信される", async ({ request }) => {
    const sw = await request.get("/sw.js");
    expect(sw.status()).toBe(200);
    expect(sw.headers()["content-type"]).toContain("javascript");
    expect(sw.headers()["cache-control"]).toContain("no-cache");
    expect((await request.get("/offline.html")).status()).toBe(200);
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);
    expect((await manifest.json()).start_url).toBeTruthy();
  });

  test("登録され、圏外でも真っ白にならない", async ({ page, context, errors }) => {
    await page.goto("/about");
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(scope).toMatch(/\/$/);
    // 初回はまだ制御下にないので、1 度読み直して SW 経由にする
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await context.setOffline(true);
    // 見たことのないページ → offline.html
    await page.goto("/terms").catch(() => {});
    await expect(page.getByRole("heading", { name: "インターネットにつながっていません" })).toBeVisible();
    // 一度見たページは控えが出る
    await page.goto("/about").catch(() => {});
    await expect(page.getByRole("heading", { name: "運営者情報" })).toBeVisible();
    await context.setOffline(false);
    // 圏外中の通信失敗（ERR_INTERNET_DISCONNECTED）は想定どおり。未捕捉の例外が無いことを確かめる
    expect(errors.filter((e) => !e.includes("ERR_INTERNET_DISCONNECTED"))).toEqual([]);
  });

  test("登録に失敗しても未捕捉のエラーにならない", async ({ page, context, errors }) => {
    // SW スクリプトの取得は page.route では捕まらないので context.route で失敗させる
    await context.route("**/sw.js", (route) => route.fulfill({ status: 500, body: "boom" }));
    const warnings: string[] = [];
    page.on("console", (m) => { if (m.type() === "warning") warnings.push(m.text()); });
    await page.goto("/about");
    await expect.poll(() => warnings.some((w) => w.includes("Service Worker"))).toBe(true);
    expect(errors.filter((e) => e.startsWith("pageerror"))).toEqual([]);
  });
});
