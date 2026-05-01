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

async function gql(query: string): Promise<unknown> {
  try {
    const res = await fetch(`${KIDS_API}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      credentials: "include",
    })
    return res.json()
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

export async function mailLogin(mailAddress: string, password: string): Promise<{ id: string; success: boolean } | null> {
  const data = await gql(`mutation { mailLogin(input: { mailAddress: ${JSON.stringify(mailAddress)}, password: ${JSON.stringify(password)} }) { id success } }`) as Record<string, unknown> | null
  return (data as { data?: { mailLogin?: { id: string; success: boolean } } })?.data?.mailLogin ?? null
}

export async function registerUser(mailAddress: string, password: string): Promise<boolean> {
  const data = await gql(`mutation { mailTemporaryRegister(input: { mailAddress: ${JSON.stringify(mailAddress)}, password: ${JSON.stringify(password)} }) { success } }`) as Record<string, unknown> | null
  return !!(data as { data?: { mailTemporaryRegister?: { success: boolean } } })?.data?.mailTemporaryRegister?.success
}

export async function registerUserDone(token: string): Promise<boolean> {
  const data = await gql(`query { registerUserDone(token: ${JSON.stringify(token)}) { success } }`) as Record<string, unknown> | null
  return !!(data as { data?: { registerUserDone?: { success: boolean } } })?.data?.registerUserDone?.success
}

export async function forgotPassword(mailAddress: string): Promise<boolean> {
  const data = await gql(`mutation { mailForget(input: { mailAddress: ${JSON.stringify(mailAddress)} }) { success } }`) as Record<string, unknown> | null
  return !!(data as { data?: { mailForget?: { success: boolean } } })?.data?.mailForget?.success
}

export async function getSocialAuthUrl(provider: "google" | "x" | "facebook" | "line", redirectUrl: string): Promise<string | null> {
  const queryMap: Record<string, string> = {
    google: `query { getGoogleAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    x: `query { getXAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    facebook: `query { getFacebookAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
    line: `query { getLineAuthUrl(redirectUrl: ${JSON.stringify(redirectUrl)}) }`,
  }
  const fieldMap: Record<string, string> = {
    google: "getGoogleAuthUrl", x: "getXAuthUrl", facebook: "getFacebookAuthUrl", line: "getLineAuthUrl",
  }
  const data = await gql(queryMap[provider]) as Record<string, unknown> | null
  return (data as { data?: Record<string, string> })?.data?.[fieldMap[provider]] ?? null
}

export async function socialLoginCallback(
  provider: "google" | "x" | "facebook" | "line" | "tiktok",
  code: string,
  state: string | null,
  redirectUrl: string,
): Promise<{ id: string; success: boolean } | null> {
  let query: string
  if (provider === "google") {
    query = `query { googleLogin(code: ${JSON.stringify(code)}, redirectUrl: ${JSON.stringify(redirectUrl)}) { id success } }`
  } else {
    const fieldName = provider === "x" ? "xLogin" : provider === "facebook" ? "facebookLogin" : provider === "line" ? "lineLogin" : "tiktokLogin"
    query = `query { ${fieldName}(code: ${JSON.stringify(code)}, state: ${JSON.stringify(state ?? "")}, redirectUrl: ${JSON.stringify(redirectUrl)}) { id success } }`
  }
  const fieldName = provider === "google" ? "googleLogin" : provider === "x" ? "xLogin" : provider === "facebook" ? "facebookLogin" : provider === "line" ? "lineLogin" : "tiktokLogin"
  const data = await gql(query) as Record<string, unknown> | null
  return (data as { data?: Record<string, { id: string; success: boolean }> })?.data?.[fieldName] ?? null
}

export async function logoutUser(): Promise<void> {
  await gql(`mutation { logout { success } }`)
}

// 別ドメインから受け取ったワンタイムトークンを使って sessionId Cookie を発行してもらう。
export async function exchangeSessionTransferToken(token: string): Promise<{ id: string; success: boolean } | null> {
  const query = `mutation { exchangeSessionTransferToken(token: ${JSON.stringify(token)}) { id success } }`
  const data = await gql(query) as Record<string, unknown> | null
  return (data as { data?: { exchangeSessionTransferToken?: { id: string; success: boolean } } })?.data?.exchangeSessionTransferToken ?? null
}
