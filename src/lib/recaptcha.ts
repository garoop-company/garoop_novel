/**
 * reCAPTCHA v3 のトークンを取る（create.garoop.jp の kids_web/src/lib/recaptcha.ts と同じ仕組み）。
 *
 * ログイン・新規登録・パスワード再設定の送信直前に getRecaptchaToken(action) を呼び、
 * 返ってきたトークンを X-Recaptcha-Token ヘッダーで kids_api に送る。判定は kids_api
 * （service/recaptcha.go）が行い、action が合わないトークンは通さない。
 *
 * スクリプトは最初に必要になったとき（またはログイン画面を開いたときの preloadRecaptcha）に読む。
 * 全ページで読むと、ログインしない人にも Google のスクリプトと右下のバッジが出てしまうため。
 *
 * 読み込みに失敗しても例外にはせず空文字を返す。kids_api 側が判定して止めるかどうかを決める
 * （止めない設定のあいだは、広告ブロッカーなどで読めない人もこれまでどおり使える）。
 */

// サイトキーは公開される値（ページの HTML に出る）なので既定値をここに置く。
// シークレットキーはサーバーの環境変数 RECAPTCHA_SECRET にだけ置くこと（kids_api と、このサイトの /api/chat-with-baby）。
// リポジトリ・ドキュメント・テストには絶対に書かない。
export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LfJLPYtAAAAAHZEcASIof6DA1EJy568OrePNZKu"

export const RECAPTCHA_HEADER = "X-Recaptcha-Token"

/** kids_api の graph/recaptcha_helpers.go と同じ名前にすること */
export type KidsApiRecaptchaAction = "login" | "signup" | "forgot_password" | "reset_password"
/** このサイト自身の API ルートで判定する操作（src/lib/recaptcha-server.ts） */
export type LocalRecaptchaAction = "chat"
export type RecaptchaAction = KidsApiRecaptchaAction | LocalRecaptchaAction

type Grecaptcha = {
  ready: (cb: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

const TOKEN_TIMEOUT_MS = 8000
let loading: Promise<Grecaptcha | null> | null = null

function loadRecaptcha(): Promise<Grecaptcha | null> {
  if (typeof window === "undefined") return Promise.resolve(null)
  if (loading) return loading
  loading = new Promise((resolve) => {
    const done = () => {
      const g = window.grecaptcha
      if (!g) return resolve(null)
      g.ready(() => resolve(g))
    }
    if (window.grecaptcha) return done()
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`
    script.async = true
    script.defer = true
    script.onload = done
    script.onerror = () => {
      // 次の送信でもう一度読みにいけるようにする
      loading = null
      resolve(null)
    }
    document.head.appendChild(script)
  })
  return loading
}

/** ログイン画面を開いたときに呼んでおくと、送信時の待ち時間が減る */
export function preloadRecaptcha(): void {
  void loadRecaptcha()
}

/** action 用のトークン。取れなければ空文字 */
export async function getRecaptchaToken(action: RecaptchaAction): Promise<string> {
  const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(""), TOKEN_TIMEOUT_MS))
  const token = (async () => {
    try {
      const g = await loadRecaptcha()
      if (!g) return ""
      return await g.execute(RECAPTCHA_SITE_KEY, { action })
    } catch {
      return ""
    }
  })()
  return Promise.race([token, timeout])
}

/** fetch に足すヘッダー（トークンを載せる） */
export async function recaptchaHeaders(action: RecaptchaAction): Promise<Record<string, string>> {
  return { [RECAPTCHA_HEADER]: await getRecaptchaToken(action) }
}

/** kids_api が reCAPTCHA で止めたときのエラーコード（Result.errorCode / GraphQL エラーの message） */
export const RECAPTCHA_FAILED = "RECAPTCHA_FAILED"

/** エラーが reCAPTCHA で止められたものか */
export function isRecaptchaFailure(err: unknown): boolean {
  return String((err as { message?: string })?.message ?? err ?? "").includes(RECAPTCHA_FAILED)
}

/** reCAPTCHA で止められたときに出す文言（ログイン画面は日本語のみ） */
export const RECAPTCHA_FAILED_MESSAGE =
  "自動操作の可能性があるため、いまは受け付けられませんでした。少し時間をおいて、もう一度お試しください。"
