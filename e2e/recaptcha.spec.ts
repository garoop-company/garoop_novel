import type { Page } from "@playwright/test";
import { test, expect, MY_BABY } from "./fixtures";

const NEW_SITE_KEY = "6LfJLPYtAAAAAHZEcASIof6DA1EJy568OrePNZKu";

/** Google の reCAPTCHA スクリプトを差し替え、読み込まれた URL を記録する */
async function mockGoogle(page: Page) {
  const scriptUrls: string[] = [];
  await page.route("https://www.google.com/recaptcha/api.js**", async (route) => {
    scriptUrls.push(route.request().url());
    await route.fulfill({
      contentType: "application/javascript",
      body: `window.grecaptcha = {
        ready: (cb) => cb(),
        execute: (key, opts) => Promise.resolve("tok-" + opts.action + "-" + key.slice(0, 8)),
      };`,
    });
  });
  return scriptUrls;
}

/** api.garoop.jp へ送られた mutation と X-Recaptcha-Token を記録する（応答は fixtures のモック） */
async function recordKidsApi(page: Page) {
  const sent: { op: string; token: string | undefined }[] = [];
  await page.route("https://api.garoop.jp/**", async (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      const q = ((req.postDataJSON() as { query?: string } | null)?.query ?? "").trim();
      const op = q.match(/^mutation\s*\{\s*(\w+)/)?.[1];
      if (op) sent.push({ op, token: req.headers()["x-recaptcha-token"] });
    }
    await route.fallback();
  });
  return sent;
}

const tokenFor = (action: string) => `tok-${action}-${NEW_SITE_KEY.slice(0, 8)}`;

test.describe("reCAPTCHA v3", () => {
  test("フォームの無い画面ではスクリプトを読まない", async ({ page }) => {
    const scripts = await mockGoogle(page);
    await page.goto("/about");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    expect(scripts).toEqual([]);
    await expect(page.getByTestId("recaptcha-notice")).toHaveCount(0);
  });

  test("ログイン・新規登録・パスワード再設定メールが正しい action のトークンを送る", async ({ page }) => {
    const scripts = await mockGoogle(page);
    const sent = await recordKidsApi(page);
    await page.goto("/about");
    await page.getByRole("button", { name: "ログイン" }).filter({ visible: true }).first().click();

    // ログイン画面を開いた時点で新しいサイトキーで読み込む。バッジの代わりの表記も出る
    await expect.poll(() => scripts.length).toBeGreaterThan(0);
    expect(scripts[0]).toContain(`render=${NEW_SITE_KEY}`);
    await expect(page.getByTestId("recaptcha-notice")).toBeVisible();

    const modal = page.locator("div.fixed.inset-0.z-\\[200\\]");
    // ログイン
    await modal.locator('input[type="email"]').fill("e2e@example.com");
    await modal.locator('input[type="password"]').fill("password123");
    await modal.locator('button[type="submit"]').click();
    await expect.poll(() => sent.find((s) => s.op === "mailLogin")?.token).toBe(tokenFor("login"));

    // 新規登録
    await modal.getByRole("link", { name: "新規登録" }).click();
    await modal.locator('input[type="email"]').fill("e2e@example.com");
    const pw = modal.locator('input[type="password"]');
    await pw.nth(0).fill("password123");
    await pw.nth(1).fill("password123");
    await modal.locator('button[type="submit"]').click();
    await expect.poll(() => sent.find((s) => s.op === "mailTemporaryRegister")?.token).toBe(tokenFor("signup"));

    // パスワード再設定メール
    await modal.getByRole("link", { name: "ログイン" }).click();
    await modal.getByRole("link", { name: "パスワードを忘れた" }).click();
    await modal.locator('input[type="email"]').fill("e2e@example.com");
    await modal.locator('button[type="submit"]').click();
    await expect.poll(() => sent.find((s) => s.op === "mailForget")?.token).toBe(tokenFor("forgot_password"));
  });

  test.describe("赤ちゃんとのチャット", () => {
    test.use({ mockOptions: { loggedIn: true, myBabies: [MY_BABY], publicBabies: [] } });

    test("送信に chat のトークンが付き、止められたときはやさしい文言を出す", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("garu-sprite-motion", "off"));
      const scripts = await mockGoogle(page);
      const tokens: (string | undefined)[] = [];
      let reject = false;
      await page.route("**/api/chat-with-baby", async (route) => {
        tokens.push(route.request().headers()["x-recaptcha-token"]);
        if (reject) await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ error: "RECAPTCHA_FAILED" }) });
        else await route.fulfill({ contentType: "application/json", body: JSON.stringify({ text: "ばぶ!" }) });
      });

      await page.goto("/about");
      expect(scripts).toEqual([]);
      await page.getByRole("button", { name: `${MY_BABY.name}に話しかける` }).click();
      await expect.poll(() => scripts.length).toBeGreaterThan(0);
      await expect(page.getByTestId("recaptcha-notice")).toBeVisible();

      const input = page.locator("textarea").first();
      await input.fill("こんにちは");
      await page.getByRole("button", { name: "送る" }).click();
      await expect(page.getByText("ばぶ!")).toBeVisible();
      expect(tokens[0]).toBe(tokenFor("chat"));

      reject = true;
      await input.fill("もういちど");
      await page.getByRole("button", { name: "送る" }).click();
      await expect(page.getByText("いまはおへんじできないよ")).toBeVisible();
    });
  });
});
