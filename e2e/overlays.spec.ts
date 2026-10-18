import type { Locator, Page } from "@playwright/test";
import { test, expect, MY_BABY } from "./fixtures";

// スマホ: ダイアログ・モーダル・ドロワーが下ナビ（BottomNav）より手前に出ること
test.use({ mockOptions: { loggedIn: true, myBabies: [MY_BABY], publicBabies: [] } });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "下ナビはスマホ幅でのみ表示される");
  // 赤ちゃんのお散歩・ぴょんぴょんを止めてタップを安定させる
  await page.addInitScript(() => localStorage.setItem("garu-sprite-motion", "off"));
});

/** target の中心（または指定位置）にある最前面の要素が container の中にあり、下ナビではないこと */
async function expectOnTop(page: Page, target: Locator, container: Locator, point?: { x: number; y: number }) {
  const box = (await target.boundingBox())!;
  expect(box).toBeTruthy();
  const p = point ?? { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const handle = await container.elementHandle();
  const result = await page.evaluate(
    ({ x, y, container }) => {
      const hit = document.elementFromPoint(x, y);
      const nav = document.querySelector("nav.fixed.bottom-0");
      return { inContainer: !!hit && container!.contains(hit), inNav: !!hit && !!nav && nav.contains(hit) };
    },
    { ...p, container: handle },
  );
  expect(result.inNav, "下ナビに覆われている").toBe(false);
  expect(result.inContainer, "最前面がダイアログではない").toBe(true);
}

test("赤ちゃんとのチャット: 入力欄が下ナビに隠れない", async ({ page }) => {
  await page.goto("/ja");
  await page.getByRole("button", { name: `${MY_BABY.name}に話しかける` }).tap();
  const input = page.locator("textarea").first();
  await expect(input).toBeVisible();
  const dialog = input.locator("xpath=ancestor::div[contains(@class,'fixed') and contains(@class,'inset-0')][1]");
  await expectOnTop(page, input, dialog);
});

test("プランの説明: 下端のボタンが下ナビに隠れない", async ({ page }) => {
  await page.goto("/ja");
  // スマホではプランのボタンはメニュー（ドロワー）の中にある
  await page.getByRole("button", { name: "Open menu" }).filter({ visible: true }).first().tap();
  await page.getByRole("button", { name: "プランの説明を見る" }).filter({ visible: true }).first().tap();
  const link = page.getByText("プランを変更する");
  await expect(link).toBeVisible();
  await page.waitForTimeout(500); // 開くアニメーションの完了待ち
  const modal = link.locator("xpath=ancestor::div[contains(@class,'fixed') and contains(@class,'inset-0')][1]");
  await expectOnTop(page, link, modal);
});

test("メニュー（ドロワー）: 下端が下ナビに隠れない", async ({ page }) => {
  await page.goto("/ja");
  await page.getByRole("button", { name: "Open menu" }).filter({ visible: true }).first().tap();
  const drawer = page.getByRole("dialog", { name: "Site menu" });
  await expect(drawer).toBeVisible();
  await page.waitForTimeout(500); // スライドイン完了待ち
  const box = (await drawer.boundingBox())!;
  const vh = page.viewportSize()!.height;
  await expectOnTop(page, drawer, drawer, { x: box.x + box.width / 2, y: vh - 24 });
});
