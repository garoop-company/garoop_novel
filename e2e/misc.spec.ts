import { test, expect } from "./fixtures";

test("ハッチペット: 初期表示で既定のペットが選ばれている", async ({ page, errors }) => {
  await page.goto("/ja/hatch-pets");
  const grid = page.locator("div.grid button");
  test.skip((await grid.count()) === 0, "ペット一覧（data.garoop.jp）が取得できない");
  const selected = page.locator("div.grid button.border-amber-300");
  await expect(selected).toHaveCount(1);
  const name = (await selected.locator("span").innerText()).trim();
  expect(name.length).toBeGreaterThan(0);
  // ステージにも同じペットが出ている
  await expect(page.locator("p.font-serif.text-xl")).toHaveText(name);
  await expect(page.getByRole("img", { name }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("SSO: トークンが無いとエラーを表示する", async ({ page }) => {
  await page.goto("/ja/sso");
  await expect(page.getByText("ログイン引き継ぎに失敗しました")).toBeVisible();
});
