import fs from "node:fs";
import path from "node:path";
import { test, expect } from "./fixtures";

const drama = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/dramas/garu-spy.json"), "utf8"));
const FIRST_LINE: string = drama.episodes[0].scenes[0].lines[0].text;

/** 字幕の文字数の変化を記録しながら「進む」を押し、全文が出るまで待つ */
async function advanceAndRecord(page: import("@playwright/test").Page) {
  const subtitle = page.getByTestId("drama-subtitle");
  await expect(subtitle).toBeAttached();
  await subtitle.evaluate((el) => {
    const w = window as unknown as { __lens: number[] };
    w.__lens = [];
    new MutationObserver(() => w.__lens.push((el.textContent ?? "").trim().length)).observe(el, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });
  await page.getByRole("button", { name: "進む", exact: true }).click();
  await expect(subtitle).toContainText(FIRST_LINE);
  return page.evaluate(() => (window as unknown as { __lens: number[] }).__lens.filter((n) => n > 0));
}

test("タイプライター: 1 文字ずつ表示され、最後に全文が出る", async ({ page, errors }) => {
  await page.goto("/ja/dramas/garu-spy");
  const lens = await advanceAndRecord(page);
  expect(lens.some((n) => n > 0 && n < FIRST_LINE.length), "途中の文字数が観測されない").toBe(true);
  expect(errors).toEqual([]);
});

test("prefers-reduced-motion: 全文がすぐに表示される", async ({ page, errors }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ja/dramas/garu-spy");
  const lens = await advanceAndRecord(page);
  expect(lens.length).toBeGreaterThan(0);
  for (const n of lens) expect(n).toBe(FIRST_LINE.length);
  expect(errors).toEqual([]);
});
