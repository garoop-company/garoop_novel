"use client"

import { useState } from "react"
import {
  mailLogin, registerUser, forgotPassword, getSocialAuthUrl, getLoginUser,
  type GaruLoginUser,
} from "@/lib/baby-api"

type View = "login" | "register" | "forgotPassword"

const inputClass =
  "w-full rounded-2xl border border-pink-200/65 bg-white/80 text-[#7a5872] px-3.5 py-2.5 text-sm shadow-[inset_0_1px_3px_rgba(255,214,226,0.5)] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100/55 transition-all placeholder:text-pink-200"
const labelClass = "block text-left text-[0.86rem] font-extrabold text-[#8b6b7d] mb-1"
const primaryBtn =
  "w-full mt-2 py-2.5 px-5 rounded-full text-white font-black text-lg shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
const primaryBg = { background: "linear-gradient(135deg, #fb7185 0%, #f9a8d4 52%, #93c5fd 100%)" }

function LoginForm({ onForgotPassword, onLogin }: { onForgotPassword: () => void; onLogin: (user: GaruLoginUser) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await mailLogin(email, password)
      if (res?.success) {
        sessionStorage.setItem("isLogin", "true")
        sessionStorage.setItem("garoopLoginUserId", res.id)
        const user = await getLoginUser()
        if (user) {
          window.dispatchEvent(new CustomEvent("garu-login"))
          onLogin(user)
        }
      } else {
        setError("ログインに失敗しました。パスワードが間違っているか、システムエラーです。")
      }
    } catch {
      setError("ログインに失敗しました。パスワードが間違っているか、システムエラーです。")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2.5 text-left">
      <div>
        <label className={labelClass}>メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="m@example.com" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>パスワード</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
      </div>
      {error && <p className="text-xs text-rose-500 font-bold text-center">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn} style={primaryBg}>
        {loading ? "ログイン中..." : <>ログイン <span>🚀</span></>}
      </button>
      <p className="text-[0.78rem] text-[#8a7687] text-center leading-5">
        ログインするとGaroopの
        <a href="https://garoop.jp/terms" target="_blank" rel="noopener noreferrer" className="text-pink-500 font-extrabold hover:underline">利用規約</a>
        と
        <a href="https://garoop.jp/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-500 font-extrabold hover:underline">プライバシーポリシー</a>
        に同意したことになります。
      </p>
      <div className="text-center">
        <a href="#" onClick={e => { e.preventDefault(); onForgotPassword() }} className="text-pink-500 font-extrabold text-sm hover:underline">
          パスワードを忘れた
        </a>
      </div>
    </form>
  )
}

function RegisterForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) { setError("パスワードが一致しません"); return }
    setLoading(true)
    setError("")
    const ok = await registerUser(email, password)
    if (ok) setDone(true)
    else setError("登録に失敗しました。すでに登録済みか、システムエラーです。")
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-3">
      <div className="text-3xl mb-2">📧</div>
      <p className="text-[#7c6f86] font-bold text-sm">確認メールを送信しました。<br />メール内のリンクをクリックして登録を完了してください。</p>
      <button onClick={onBack} className="mt-4 text-pink-500 font-extrabold text-sm hover:underline">ログインに戻る</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="grid gap-2.5 text-left">
      <div>
        <label className={labelClass}>メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="m@example.com" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>パスワード</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>パスワード（確認）</label>
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} className={inputClass} required />
      </div>
      {error && <p className="text-xs text-rose-500 font-bold text-center">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn} style={primaryBg}>
        {loading ? "登録中..." : "新規登録 🌸"}
      </button>
    </form>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const ok = await forgotPassword(email)
    if (ok) setDone(true)
    else setError("送信に失敗しました。時間をおいて再度お試しください。")
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-3">
      <div className="text-3xl mb-2">📬</div>
      <p className="text-[#7c6f86] font-bold text-sm">リセットメールを送信しました。</p>
      <button onClick={onBack} className="mt-4 text-pink-500 font-extrabold text-sm hover:underline">ログインに戻る</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="grid gap-2.5 text-left">
      <p className="text-sm text-[#7c6f86] font-bold">登録したメールアドレスにリセットリンクを送ります。</p>
      <div>
        <label className={labelClass}>メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="m@example.com" className={inputClass} required />
      </div>
      {error && <p className="text-xs text-rose-500 font-bold text-center">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn} style={primaryBg}>
        {loading ? "送信中..." : "送信する"}
      </button>
      <div className="text-center">
        <button type="button" onClick={onBack} className="text-pink-500 font-extrabold text-sm hover:underline">ログインに戻る</button>
      </div>
    </form>
  )
}

export function GaruLoginModal({ onClose, onLogin }: {
  onClose: () => void
  onLogin: (user: GaruLoginUser) => void
}) {
  const [view, setView] = useState<View>("login")
  const [pendingProvider, setPendingProvider] = useState<string | null>(null)
  const [socialError, setSocialError] = useState("")

  const startSocialLogin = async (provider: "google" | "x" | "facebook" | "line") => {
    setSocialError("")
    setPendingProvider(provider)
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_URL ?? window.location.origin
      let authUrl = await getSocialAuthUrl(provider, redirectUrl)
      if (!authUrl) throw new Error("auth url not found")

      if (provider === "facebook") {
        try {
          const fbUrl = new URL(authUrl)
          fbUrl.searchParams.set("scope", "public_profile,email")
          if (!fbUrl.searchParams.get("response_type")) fbUrl.searchParams.set("response_type", "code")
          authUrl = fbUrl.toString()
        } catch { throw new Error("invalid facebook auth url") }
      }

      const path = window.location.pathname
      const isCallbackPage = path.includes("/loginCallBack")
      const existingCallback = sessionStorage.getItem("login_callback_url")
      if (!isCallbackPage || !existingCallback) {
        sessionStorage.setItem("login_callback_url", path)
        localStorage.setItem("login_callback_url", path)
      }
      sessionStorage.setItem("login_provider", provider)
      localStorage.setItem("login_provider", provider)
      window.location.href = authUrl
    } catch {
      setPendingProvider(null)
      setSocialError("SNSログインの準備に失敗しました。時間をおいて再度お試しください。")
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[400px] rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(244,114,182,0.3)]"
        style={{ background: "linear-gradient(to bottom, #ffe4e6, #fdf2f8, #e0f2fe)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="p-6 grid gap-3 text-center" style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", sans-serif' }}>
            {/* ブランド */}
            <div className="flex items-center justify-center gap-3 min-h-[58px]">
              <img
                src="https://d3ez7mat4qd439.cloudfront.net/garuchan.webp"
                width={62} height={62} alt="garuchan"
                style={{ filter: "drop-shadow(0 8px 16px rgba(251, 113, 133, 0.24))" }}
              />
              <span className="text-[30px] font-black text-rose-500">Garoop</span>
            </div>

            <p className="text-[15px] px-2 text-[#7c6f86] font-bold leading-snug">
              赤ちゃんを登録して、みんなのサービスで一緒に遊ぼう
            </p>

            {/* SNSボタン */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap mt-1">
              <button
                className="group relative h-12 w-12 overflow-hidden rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-white/50"
                onClick={() => startSocialLogin("google")}
                disabled={!!pendingProvider}
                title="Googleでログイン"
              >
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-full w-full flex items-center justify-center">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "24px", height: "24px" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
              </button>

              <button
                className="group relative h-12 w-12 overflow-hidden rounded-full bg-black shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
                onClick={() => startSocialLogin("x")}
                disabled={!!pendingProvider}
                title="Xでログイン"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-white text-lg font-black leading-none">X</span>
                </div>
              </button>

              <button
                className="group relative h-12 w-12 overflow-hidden rounded-full bg-[#1877F2] shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
                onClick={() => startSocialLogin("facebook")}
                disabled={!!pendingProvider}
                title="Facebookでログイン"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-white text-lg font-black leading-none">f</span>
                </div>
              </button>

              <button
                className="group relative h-12 w-12 overflow-hidden rounded-full bg-[#06C755] shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
                onClick={() => startSocialLogin("line")}
                disabled={!!pendingProvider}
                title="LINEでログイン"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-black tracking-wide">LINE</span>
                </div>
              </button>

              <button
                className="group relative h-12 w-12 overflow-hidden rounded-full bg-black/60 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border border-white/20"
                disabled
                title="TikTokログインは現在利用できません"
              >
                <div className="absolute inset-0 bg-white/10 opacity-40" />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-black tracking-wide">TikTok</span>
                </div>
              </button>
            </div>

            {pendingProvider && !socialError && (
              <p className="text-xs text-sky-600 font-bold">ログインの準備をしているよ...</p>
            )}
            {socialError && <p className="text-xs text-rose-500 font-bold">{socialError}</p>}

            {/* 区切り */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-rose-200/90" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="rounded-full bg-white/85 px-3 py-1 text-rose-400 font-black shadow-sm">または</span>
              </div>
            </div>

            {view === "login" && <LoginForm onForgotPassword={() => setView("forgotPassword")} onLogin={onLogin} />}
            {view === "register" && <RegisterForm onBack={() => setView("login")} />}
            {view === "forgotPassword" && <ForgotPasswordForm onBack={() => setView("login")} />}

            {view !== "forgotPassword" && (
              <div className="text-[0.82rem] text-[#8a7687] text-center">
                {view === "login"
                  ? <>アカウントがない？<a href="#" onClick={e => { e.preventDefault(); setView("register") }} className="text-pink-500 font-extrabold hover:underline ml-1">新規登録</a></>
                  : <>すでにアカウントがある？<a href="#" onClick={e => { e.preventDefault(); setView("login") }} className="text-pink-500 font-extrabold hover:underline ml-1">ログイン</a></>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
