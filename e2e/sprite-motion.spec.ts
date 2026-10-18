import { test, expect, MY_BABY, PUBLIC_BABIES, samplePositions } from "./fixtures";

const SWITCH_NAME = "キャラクターのアニメーションを切り替え";
const PANEL_PETS = '[data-testid="baby-companion-panel"] [role="img"]';

test.describe("「うごかす」スイッチ", () => {
  test("アイコンだけ・role=switch・aria-checked が切り替わり、リロード後も保持される", async ({ page }) => {
    await page.goto("/ja/dramas/garu-spy");
    const sw = page.getByRole("switch", { name: SWITCH_NAME });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    // 見える文字はアイコンのみ（文言は aria-label / title だけ）
    await expect(sw).toHaveText("⏸");
    await expect(sw).toHaveAttribute("title", "とめる");

    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(sw).toHaveText("▶");
    await expect(sw).toHaveAttribute("title", "うごかす");
    expect(await page.evaluate(() => localStorage.getItem("garu-sprite-motion"))).toBe("off");
    await expect(page.locator("html")).toHaveAttribute("data-sprite-motion", "off");

    await page.reload();
    const sw2 = page.getByRole("switch", { name: SWITCH_NAME });
    await expect(sw2).toHaveAttribute("aria-checked", "false");
    await expect(sw2).toHaveText("▶");

    await sw2.click();
    await expect(sw2).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate(() => localStorage.getItem("garu-sprite-motion"))).toBe("on");
  });
});

test.describe("スプライトの再生制御（右パネル: 1440px 以上）", () => {
  test.use({ mockOptions: { loggedIn: true, myBabies: [MY_BABY], publicBabies: PUBLIC_BABIES } });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "赤ちゃんパネルは 1440px 以上でのみ表示される");
  });

  async function waitPanelPets(page: import("@playwright/test").Page) {
    await expect(page.locator(PANEL_PETS)).toHaveCount(1 + PUBLIC_BABIES.length);
  }

  test("「うごかす」ON: 自分の子だけ常時うごき、ほかの子は止まっている", async ({ page }) => {
    await page.goto("/ja/about");
    await waitPanelPets(page);
    const res = await samplePositions(page, PANEL_PETS, 1500);
    const mine = res.find((r) => r.label === "ペット-e2e-mine")!;
    expect(mine.distinct).toBeGreaterThan(1);
    for (const r of res.filter((r) => r.label !== "ペット-e2e-mine")) expect(r.distinct, r.label).toBe(1);
  });

  test("「うごかす」OFF: タップした 1 体だけが約 3 秒うごき、同時には 1 体だけ", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("garu-sprite-motion", "off"));
    await page.goto("/ja/about");
    await waitPanelPets(page);

    // 何もしなければ全員止まっている
    for (const r of await samplePositions(page, PANEL_PETS, 1000)) expect(r.distinct, r.label).toBe(1);

    const target = page.locator(`${PANEL_PETS}[aria-label="ペット-e2e-pub-b"]`);
    await target.click();
    const t0 = Date.now();
    const playing = await samplePositions(page, PANEL_PETS, 1200);
    for (const r of playing) {
      if (r.label === "ペット-e2e-pub-b") expect(r.distinct, r.label).toBeGreaterThan(1);
      else expect(r.distinct, r.label).toBe(1);
    }

    // 約 3.2 秒で止まる
    await page.waitForTimeout(Math.max(0, 3600 - (Date.now() - t0)));
    for (const r of await samplePositions(page, PANEL_PETS, 800)) expect(r.distinct, r.label).toBe(1);

    // 別の子をタップすると、前の子は止まって新しい子だけうごく
    await page.locator(`${PANEL_PETS}[aria-label="ペット-e2e-pub-c"]`).click();
    await page.locator(`${PANEL_PETS}[aria-label="ペット-e2e-pub-a"]`).click();
    for (const r of await samplePositions(page, PANEL_PETS, 1000)) {
      if (r.label === "ペット-e2e-pub-a") expect(r.distinct, r.label).toBeGreaterThan(1);
      else expect(r.distinct, r.label).toBe(1);
    }
  });

  test("prefers-reduced-motion: 既定で止まり、ぴょんぴょんの CSS も止まる", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ja/about");
    await waitPanelPets(page);
    await expect(page.getByRole("switch", { name: SWITCH_NAME }).first()).toHaveAttribute("aria-checked", "false");
    for (const r of await samplePositions(page, PANEL_PETS, 1200)) expect(r.distinct, r.label).toBe(1);

    const hop = page.locator(".garu-baby-hop").first();
    await expect(hop).toBeAttached();
    expect(await hop.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("タブが非表示の間は止まる", async ({ page }) => {
    await page.goto("/ja/about");
    await waitPanelPets(page);
    const mineSel = `${PANEL_PETS}[aria-label="ペット-e2e-mine"]`;
    expect((await samplePositions(page, mineSel, 800))[0].distinct).toBeGreaterThan(1);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect((await samplePositions(page, mineSel, 800))[0].distinct).toBe(1);
  });
});
