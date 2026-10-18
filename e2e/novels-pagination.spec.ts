import fs from "node:fs";
import path from "node:path";
import { test, expect } from "./fixtures";

// playwright.config.ts の webServer で NOVELS_PAGE_SIZE=8 にしている
const PAGE_SIZE = 8;
const SCREEN_DIR = path.join("test-results", "screens");

async function noOverflow(page: import("@playwright/test").Page) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(o.sw).toBeLessThanOrEqual(o.cw);
}

test("小説一覧: ◀ ▶ と数字のページ送りで移動でき、SEO 用のリンクも正しい", async ({ page, errors }, testInfo) => {
  await page.goto("/ja/novels");
  const pager = page.getByRole("navigation", { name: "ページ送り" });
  test.skip((await pager.count()) === 0, "小説が 1 ページ分しかない");

  // 1 ページ目
  await expect(page.locator("a.novel-spine")).toHaveCount(PAGE_SIZE);
  await expect(pager.getByRole("link", { name: "1ページ目" })).toHaveAttribute("aria-current", "page");
  await expect(pager.getByRole("link", { name: "まえのページ" })).toHaveCount(0);
  await expect(page.locator('head link[rel="next"]')).toHaveAttribute("href", /\/novels\?page=2$/);
  await expect(page.locator('head link[rel="prev"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/novels$/);

  // 文字の少ないボタン（アイコン・数字だけ）で、タップしやすい大きさ
  const next = pager.getByRole("link", { name: "つぎのページ" });
  await expect(next).toHaveText("▶");
  for (const link of await pager.getByRole("link").all()) {
    const box = (await link.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeGreaterThanOrEqual(40);
  }
  await noOverflow(page);
  if (testInfo.project.name === "mobile") {
    fs.mkdirSync(SCREEN_DIR, { recursive: true });
    await pager.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SCREEN_DIR, "novels_pager_p1.png") });
  }

  // ▶ で 2 ページ目へ
  await next.click();
  await expect(page).toHaveURL(/\/novels\?page=2$/);
  await expect(pager.getByRole("link", { name: "2ページ目" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/novels\?page=2$/);
  await expect(page.locator('head link[rel="prev"]')).toHaveAttribute("href", /\/novels$/);
  const onPage2 = await page.locator("a.novel-spine").count();
  expect(onPage2).toBeGreaterThan(0);
  expect(onPage2).toBeLessThanOrEqual(PAGE_SIZE);

  // 最後のページでは ▶ が押せない
  const numbers = await pager.getByRole("link", { name: /ページ目$/ }).allInnerTexts();
  const last = Math.max(...numbers.map((n) => parseInt(n, 10)));
  await pager.getByRole("link", { name: `${last}ページ目` }).click();
  await expect(page).toHaveURL(new RegExp(`page=${last}$`));
  await expect(pager.getByRole("link", { name: "つぎのページ" })).toHaveCount(0);
  await expect(page.locator('head link[rel="next"]')).toHaveCount(0);

  // ◀ で戻れる
  await pager.getByRole("link", { name: "まえのページ" }).click();
  await expect(page).toHaveURL(last - 1 === 1 ? /\/novels$/ : new RegExp(`page=${last - 1}$`));
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("小説一覧: 絞り込みとページ送りが両立する", async ({ page, errors }) => {
  await page.goto("/ja/novels?lang=all");
  const pager = page.getByRole("navigation", { name: "ページ送り" });
  test.skip((await pager.count()) === 0, "小説が 1 ページ分しかない");
  // ページ送りのリンクは絞り込み条件を保つ
  await expect(pager.getByRole("link", { name: "つぎのページ" })).toHaveAttribute("href", /lang=all&page=2/);
  // 絞り込み付きの一覧は素の一覧を canonical にする
  await pager.getByRole("link", { name: "つぎのページ" }).click();
  await expect(page).toHaveURL(/lang=all&page=2/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/novels$/);
  // 「All」で全言語表示が保たれている（以前は lang が落ちて既定言語に戻っていた）
  await expect(page.getByRole("link", { name: "All", exact: true })).toHaveAttribute("href", /lang=all/);
  // 書架（カテゴリ）を切り替えると 1 ページ目に戻る
  const catHref = await page.getByRole("link", { name: "すべての書架" }).getAttribute("href");
  expect(catHref).not.toContain("page=");
  expect(errors).toEqual([]);
});

test("小説一覧: 範囲外のページは 404", async ({ page }) => {
  const res = await page.goto("/ja/novels?page=999");
  expect(res?.status()).toBe(404);
});
