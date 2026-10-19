/**
 * reCAPTCHA v3 のサーバー側判定（このサイト自身の API ルート用）。
 * kids_api の service/recaptcha.go と同じ考え方にしてある。
 *
 *   RECAPTCHA_SECRET     未設定なら判定しない（最初の 1 回だけログに出す）
 *   RECAPTCHA_ENFORCE    "1" のときだけ止める。それ以外は判定して記録するだけ
 *   RECAPTCHA_MIN_SCORE  通す最低スコア。既定 0.5
 *
 * Google に届かないとき（5 秒で打ち切り）は通す。止めると Google の障害で誰も使えなくなる。
 * クライアントから import しないこと（シークレットを扱う）。
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
const VERIFY_TIMEOUT_MS = 5000

export type RecaptchaReason =
  | "off"
  | "ok"
  | "missing_token"
  | "invalid"
  | "low_score"
  | "action_mismatch"
  | "unreachable"

export type RecaptchaVerdict = { allowed: boolean; reason: RecaptchaReason; score: number }

type SiteverifyResponse = { success?: boolean; score?: number; action?: string; "error-codes"?: string[] }

let warnedNoSecret = false

function minScore(): number {
  const v = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? "")
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.5
}

/** siteverify の結果から判定する（テストしやすいよう分けてある） */
export function judgeRecaptchaResponse(body: SiteverifyResponse, action: string, min: number): RecaptchaVerdict {
  const score = typeof body.score === "number" ? body.score : 0
  if (!body.success) return { allowed: false, reason: "invalid", score }
  // 別の操作のために取ったトークンを使い回させない
  if (body.action !== action) return { allowed: false, reason: "action_mismatch", score }
  if (score < min) return { allowed: false, reason: "low_score", score }
  return { allowed: true, reason: "ok", score }
}

async function judge(secret: string, token: string, action: string): Promise<RecaptchaVerdict> {
  if (!token) return { allowed: false, reason: "missing_token", score: 0 }
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    })
    if (!res.ok) {
      console.warn(`[recaptcha] verify bad response status=${res.status}`)
      return { allowed: true, reason: "unreachable", score: 0 }
    }
    const body = (await res.json()) as SiteverifyResponse
    return judgeRecaptchaResponse(body, action, minScore())
  } catch (e) {
    console.warn("[recaptcha] verify request failed:", e instanceof Error ? e.message : e)
    return { allowed: true, reason: "unreachable", score: 0 }
  }
}

/** token が action の操作として人間らしいか。enforce でなければ常に allowed: true */
export async function verifyRecaptcha(token: string | null | undefined, action: string): Promise<RecaptchaVerdict> {
  const secret = process.env.RECAPTCHA_SECRET
  if (!secret) {
    if (!warnedNoSecret) {
      warnedNoSecret = true
      console.info("[recaptcha] RECAPTCHA_SECRET が未設定のため判定しません")
    }
    return { allowed: true, reason: "off", score: 0 }
  }
  const enforce = process.env.RECAPTCHA_ENFORCE === "1"
  const v = await judge(secret, (token ?? "").trim(), action)
  if (v.reason !== "ok") {
    console.warn(`[recaptcha] action=${action} reason=${v.reason} score=${v.score.toFixed(2)} enforce=${enforce}`)
  }
  return enforce ? v : { ...v, allowed: true }
}
