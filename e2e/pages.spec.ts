import fs from "node:fs";
import path from "node:path";
import { test, expect, MY_BABY, PUBLIC_BABIES } from "./fixtures";

// 主要ページ: エラーなく表示でき、360px 幅で横スクロールが出ないこと
const PAGES = [
  "/ja",
  "/en",
  "/ja/novels",
  "/ja/dramas",
  "/ja/dramas/garu-spy",
  "/ja/hatch-pets",
  "/ja/about",
  "/ja/faq",
  "/ja/area",
  "/ja/contact",
  "/ja/privacy",
  "/ja/terms",
  "/ja/videos",
  "/ja/sso",
];

test.use({ mockOptions: { loggedIn: true, myBabies: [MY_BABY], publicBabies: PUBLIC_BABIES } });

const SCREEN_DIR = path.join("test-results", "screens");

async function checkPage(
  page: import("@playwright/test").Page,
  errors: string[],
  url: string,
  projectName: string,
) {
  const res = await page.goto(url, { waitUntil: "load" });
  expect(res?.status(), `${url} status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(400);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, `${url} horizontal overflow`).toBeLessThanOrEqual(overflow.clientWidth);
  expect(errors, `${url} console/page errors`).toEqual([]);

  if (projectName === "mobile") {
    fs.mkdirSync(SCREEN_DIR, { recursive: true });
    const name = url.replace(/^\//, "").replace(/\//g, "_") || "root";
    await page.screenshot({ path: path.join(SCREEN_DIR, `${name}.png`) });
  }
}

for (const url of PAGES) {
  test(`${url} が崩れずにエラーなく表示される`, async ({ page, errors }, testInfo) => {
    await checkPage(page, errors, url, testInfo.project.name);
  });
}

test("小説の詳細ページが崩れずにエラーなく表示される", async ({ page, errors }, testInfo) => {
  await page.goto("/ja/novels");
  // 既定言語（ja）のリンクは "/novels/<id>"（/ja は付かない）
  const links = page.locator('a[href^="/novels/"], a[href^="/ja/novels/"]');
  const href = (await links.count()) > 0 ? await links.first().getAttribute("href") : null;
  test.skip(!href, "小説データが 0 件のため詳細ページを確認できない");
  errors.length = 0;
  await checkPage(page, errors, href!, testInfo.project.name);
});

test("トップページ全体（360px）のスクリーンショット", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "スクリーンショット確認は 360px のみ");
  await page.goto("/ja");
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREEN_DIR, "ja_full.png"), fullPage: true });
});
