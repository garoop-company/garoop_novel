import { recaptchaHeaders, isRecaptchaFailure, RECAPTCHA_FAILED } from "@/lib/recaptcha"

const KIDS_API = process.env.NEXT_PUBLIC_SERVER_URL ?? "https://api.garoop.jp"

export interface PublicBaby {
  id: string
  name: string
  animalType: string
  personality?: string | null
  description?: string | null
  avatarUrl?: string | null
  growthLevel: number
}

export interface GaruLoginUser {
  id: string
  name: string
  iconPath: string
  planType: string
}

export interface PlanUi {
  label: string
  emoji: string
  className: string
}

export function getPlanUi(planType?: string | null): PlanUi {
  const t = (planType ?? "").toLowerCase()
  if (t.includes("vip")) return { label: "VIP", emoji: "👑", className: "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/25 to-pink-500/25 text-fuchsia-100" }
  if (t.includes("pro")) return { label: "Pro", emoji: "🚀", className: "border-cyan-400/40 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-100" }
  if (t.includes("super")) return { label: "Super", emoji: "⭐", className: "border-amber-400/40 bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-50" }
  return { label: "Free", emoji: "🌱", className: "border-white/15 bg-white/10 text-white/85" }
}

// ブラウザ側のログイン状態 (sessionStorage) を消す。
// ログイン中扱いだった場合は "garu-login" を投げてヘッダーなどに表示を更新させる。
export function clearClientAuthSession(): void {
  if (typeof window === "undefined") return
  const wasLogin = sessionStorage.getItem("isLogin") === "true"
  sessionStorage.removeItem("isLogin")
  sessionStorage.removeItem("garoopLoginUserId")
  if (wasLogin) window.dispatchEvent(new CustomEvent("garu-login"))
}

// kids_api のセッションが切れている (24時間で失効し、使っても延長されない) と
// 保護されたクエリは message が "unauthenticated" のエラーを返す。
function isUnauthenticated(data: unknown): boolean {
  const errors = (data as { errors?: { message?: string }[] } | null)?.errors
  return Array.isArray(errors) && errors.some((e) => e?.message === "unauthenticated")
}

// headers: 追加で送るヘッダー（ログイン・登録などで reCAPTCHA のトークンを載せる）
async function gql(query: string, headers?: Record<string, string>): Promise<unknown> {
  try {
    const res = await fetch(`${KIDS_API}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ query }),
      credentials: "include",
    })
    const data = await res.json()
    // セッション切れなのにログイン中の表示のまま残らないよう、ブラウザ側の状態も消す
    if (isUnauthenticated(data)) clearClientAuthSession()
    return data
  } catch {
    return null
  }
}

export async function getPublicBabies(limit = 30): Promise<PublicBaby[]> {
  const data = await gql(`query { getPublicBabies(limit: ${limit}) { id name animalType personality description avatarUrl growthLevel } }`) as Record<string, unknown> | null
  return (data as { data?: { getPublicBabies?: PublicBaby[] } })?.data?.getPublicBabies ?? []
}

export async function getLoginUser(): Promise<GaruLoginUser | null> {
  const data = await gql(`query { getLoginUser { id name iconPath planType } }`) as Record<string, unknown> | null
  return (data as { data?: { getLoginUser?: GaruLoginUser } })?.data?.getLoginUser ?? null
}

export async function getMyBabies(): Promise<PublicBaby[]> {
  const data = await gql(`query { getMyBabies { id name animalType personality description avatarUrl growthLevel } }`) as Record<string, unknown> | null
  return (data as { data?: { getMyBabies?: PublicBaby[] } })?.data?.getMyBabies ?? []
}

// errorCode: reCAPTCHA で止められたときだけ RECAPTCHA_FAILED が入る
export interface MailLoginResult {
  id: string
  success: boolean
  errorCode?: string | null
}

// 登録・パスワード再設定メールの結果。errorCode は kids_api の値
// （DUPLICATE_EMAIL / INVALID_EMAIL / EMPTY_PASSWORD / PASSWORD_TOO_LONG / SYSTEM_ERROR / RECAPTCHA_FAILED）。
// 通信できなかったときは success: false, errorCode: null。
export interface MailResult {
  success: boolean
  errorCode: string | null
}

export async function mailLogin(mailAddress: string, password: string): Promise<MailLoginResult | null> {
  const query = `mutation { mailLogin(input: { mailAddress: ${JSON.stringify(mailAddress)}, password: ${JSON.stringify(password)} }) { id success } }`
  const data = await gql(query, await recaptchaHeaders("login")) as { data?: { mailLogin?: MailLoginResult | null }; errors?: { message?: string }[] } | null
  // mailLogin の結果には理由を載せる欄がないので、reCAPTCHA で止めたときは GraphQL のエラーで返ってくる
  if (data?.errors?.some(e => isRecaptchaFailure(e))) return { id: "", success: false, errorCode: RECAPTCHA_FAILED }
  return data?.data?.mailLogin ?? null
}

// redirectUrl は kids_api が確認メールのリンク（redirectUrl + "/loginCallBack?token=..."）を作るのに使う。
// このサイトの /loginCallBack が registerUserDone で本登録を済ませる。
export async function registerUser(mailAddress: string, password: string): Promise<MailResult> {
  const redirectUrl = typeof window === "undefined" ? "" : window.location.origin
  const query = `mutation { mailTemporaryRegister(input: { mailAddress: ${JSON.stringify(mailAddress)}, password: ${JSON.stringify(password)}, redirectUrl: ${JSON.stringify(redirectUrl)} }) { success errorCode } }`
  const data = await gql(query, await recaptchaHeaders("signup")) as { data?: { mailTemporaryRegister?: MailResult | null } } | null
  const result = data?.data?.mailTemporaryRegister
  return { success: !!result?.success, errorCode: result?.errorCode ?? null }
}

export async function registerUserDone(token: string): Promise<boolean> {
  const data = await gql(`query { registerUserDone(token: ${JSON.stringify(token)}) { success } }`) as Record<string, unknown> | null
  return !!(data as { data?: { registerUserDone?: { success: boolean } } })?.data?.registerUserDone?.success
}

// パスワード再設定メールのリンクは kids_api が redirectUrl + "/registerNewPassword?token=..." で作る。
// このサイトには新しいパスワードを決めるページ（registerNewPassword）がないので、
// そのページを持つ create.garoop.jp（kids_web）に送る。アカウントは共通なので、そこで決めたパスワードでここにもログインできる。
const PASSWORD_RESET_SITE_URL = "https://create.garoop.jp"

export async function forgotPassword(mailAddress: string): Promise<MailResult> {
  const query = `mutation { mailForget(mailAddress: ${JSON.stringify(mailAddress)}, redirectUrl: ${JSON.stringify(PASSWORD_RESET_SITE_URL)}) { success errorCode } }`
  const data = await gql(query, await recaptchaHeaders("forgot_password")) as { data?: { mailForget?: MailResult | null } } | null
  const result = data?.data?.mailForget
  return { success: !!result?.success, errorCode: result?.errorCode ?? null }
}

export async function getSocialAuthUrl(provider: "google" | "x" | "facebook" | "line" | "chatgpt", redirectUrl: string): Promise<string | null> {
  const queryMap: Record<string, string> = {
    google: `query { getGoogleAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    x: `query { getXAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    facebook: `query { getFacebookAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    line: `query { getLineAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    chatgpt: `query { getChatgptAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
  }
  const fieldMap: Record<string, string> = {
    google: "getGoogleAuthUrl", x: "getXAuthUrl", facebook: "getFacebookAuthUrl", line: "getLineAuthUrl", chatgpt: "getChatgptAuthUrl",
  }
  const data = await gql(queryMap[provider]) as Record<string, unknown> | null
  return (data as { data?: Record<string, string> })?.data?.[fieldMap[provider]] ?? null
}

export async function socialLoginCallback(
  provider: "google" | "x" | "facebook" | "line" | "tiktok" | "chatgpt",
  code: string,
  state: string | null,
  redirectUrl: string,
): Promise<{ id: string; success: boolean } | null> {
  let query: string
  if (provider === "google") {
    query = `query { googleLogin(code: ${JSON.stringify(code)}, redirectUrl: ${JSON.stringify(redirectUrl)}) { id success } }`
  } else {
    const fieldName = provider === "x" ? "xLogin" : provider === "facebook" ? "facebookLogin" : provider === "line" ? "lineLogin" : provider === "chatgpt" ? "chatgptLogin" : "tiktokLogin"
    query = `query { ${fieldName}(code: ${JSON.stringify(code)}, state: ${JSON.stringify(state ?? "")}, redirectUrl: ${JSON.stringify(redirectUrl)}) { id success } }`
  }
  const fieldName = provider === "google" ? "googleLogin" : provider === "x" ? "xLogin" : provider === "facebook" ? "facebookLogin" : provider === "line" ? "lineLogin" : provider === "chatgpt" ? "chatgptLogin" : "tiktokLogin"
  const data = await gql(query) as Record<string, unknown> | null
  return (data as { data?: Record<string, { id: string; success: boolean }> })?.data?.[fieldName] ?? null
}

export async function logoutUser(): Promise<void> {
  await gql(`mutation { logout { success } }`)
}

// 別ドメインから受け取ったワンタイムトークンを使って sessionId Cookie を発行してもらう。
// DevTools Network で operationName を表示できるよう、無名 mutation ではなく named operation で送る。
export async function exchangeSessionTransferToken(token: string): Promise<{ id: string; success: boolean } | null> {
  try {
    const res = await fetch(`${KIDS_API}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "ExchangeSessionTransferToken",
        query: `mutation ExchangeSessionTransferToken($token: String!) {
  exchangeSessionTransferToken(token: $token) { id success }
}`,
        variables: { token },
      }),
      credentials: "include",
    })
    const data = await res.json()
    return data?.data?.exchangeSessionTransferToken ?? null
  } catch {
    return null
  }
}
