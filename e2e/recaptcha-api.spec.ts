import { test, expect } from "@playwright/test";
import { POST } from "../src/app/api/chat-with-baby/route";

// /api/chat-with-baby のサーバー側判定（kids_api の service/recaptcha.go と同じ考え方）。
// ブラウザは使わず、Node 上でルートを直接呼ぶ。Google の siteverify と Groq は fetch を差し替える。
// シークレットはダミー値（本物はリポジトリに置かない）。

type Siteverify = { success: boolean; score?: number; action?: string } | "unreachable";

const ENV_KEYS = ["RECAPTCHA_SECRET", "RECAPTCHA_ENFORCE", "RECAPTCHA_MIN_SCORE", "GROQ_API_KEY"] as const;
let savedEnv: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
let groqCalls = 0;
let verifyCalls = 0;

function stubFetch(siteverify: Siteverify) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("recaptcha/api/siteverify")) {
      verifyCalls++;
      if (siteverify === "unreachable") throw new TypeError("fetch failed");
      return new Response(JSON.stringify(siteverify), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.includes("api.groq.com")) {
      groqCalls++;
      return new Response(JSON.stringify({ choices: [{ message: { content: "ばぶ" } }] }), { status: 200 });
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
}

function chatRequest(token?: string) {
  return new Request("http://localhost/api/chat-with-baby", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-Recaptcha-Token": token } : {}) },
    body: JSON.stringify({ message: "こんにちは", baby: { name: "ぴよ" } }),
  });
}

test.describe("chat-with-baby の reCAPTCHA 判定", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Node 上のテストなので 1 回だけ流す");
    savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
    process.env.RECAPTCHA_SECRET = "dummy-secret-for-test";
    process.env.GROQ_API_KEY = "dummy-groq";
    delete process.env.RECAPTCHA_ENFORCE;
    delete process.env.RECAPTCHA_MIN_SCORE;
    groqCalls = 0;
    verifyCalls = 0;
  });
  test.afterEach(() => {
    globalThis.fetch = realFetch;
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
  });

  test("ENFORCE=1 でスコアが低いと 403 で止め、Groq を呼ばない", async () => {
    process.env.RECAPTCHA_ENFORCE = "1";
    stubFetch({ success: true, score: 0.1, action: "chat" });
    const res = await POST(chatRequest("tok"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "RECAPTCHA_FAILED" });
    expect(groqCalls).toBe(0);
  });

  test("ENFORCE=1 で action が違う・トークンが無いと止める", async () => {
    process.env.RECAPTCHA_ENFORCE = "1";
    stubFetch({ success: true, score: 0.9, action: "login" });
    expect((await POST(chatRequest("tok"))).status).toBe(403);
    expect((await POST(chatRequest())).status).toBe(403);
  });

  test("ENFORCE=1 でもスコアが MIN_SCORE 以上なら通す", async () => {
    process.env.RECAPTCHA_ENFORCE = "1";
    process.env.RECAPTCHA_MIN_SCORE = "0.3";
    stubFetch({ success: true, score: 0.4, action: "chat" });
    const res = await POST(chatRequest("tok"));
    expect(res.status).toBe(200);
    expect(groqCalls).toBe(1);
  });

  test("ENFORCE が 1 でなければ低スコアでも通す（記録だけ）", async () => {
    stubFetch({ success: true, score: 0.1, action: "chat" });
    expect((await POST(chatRequest("tok"))).status).toBe(200);
    expect(verifyCalls).toBe(1);
  });

  test("Google に届かないときは ENFORCE=1 でも通す", async () => {
    process.env.RECAPTCHA_ENFORCE = "1";
    stubFetch("unreachable");
    expect((await POST(chatRequest("tok"))).status).toBe(200);
  });

  test("RECAPTCHA_SECRET が未設定なら判定しない", async () => {
    delete process.env.RECAPTCHA_SECRET;
    process.env.RECAPTCHA_ENFORCE = "1";
    stubFetch({ success: false });
    expect((await POST(chatRequest())).status).toBe(200);
    expect(verifyCalls).toBe(0);
  });
});
