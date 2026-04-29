"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { socialLoginCallback, registerUserDone } from "@/lib/baby-api"
import { Suspense } from "react"

const LOCK_PREFIX = "login_callback_lock_"

function getStorage(key: string) {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(key) || localStorage.getItem(key)
}
function removeStorage(key: string) {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
}

function LoginCallBackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const token = searchParams.get("token")
    const providerFromQuery = searchParams.get("provider")

    const run = async () => {
      const redirectUrl = process.env.NEXT_PUBLIC_URL ?? window.location.origin

      // メール認証完了
      if (token) {
        const lockKey = `${LOCK_PREFIX}register_${token}`
        if (getStorage(lockKey)) return
        sessionStorage.setItem(lockKey, token)
        const ok = await registerUserDone(token).catch(() => false)
        removeStorage(lockKey)
        if (ok) {
          window.location.href = redirectUrl
        } else {
          setStatus("error")
        }
        return
      }

      // SNS/Googleログイン
      if (!code) return
      const provider = (providerFromQuery || getStorage("login_provider") || "google") as "google" | "x" | "facebook" | "line" | "tiktok"
      const lockKey = `${LOCK_PREFIX}${provider}_${code}`
      if (getStorage(lockKey)) return
      sessionStorage.setItem(lockKey, code)
      localStorage.setItem(lockKey, code)

      const result = await socialLoginCallback(provider, code, state, redirectUrl).catch(() => null)
      removeStorage(lockKey)

      if (result?.success) {
        sessionStorage.setItem("isLogin", "true")
        sessionStorage.setItem("garoopLoginUserId", result.id)
        removeStorage("login_provider")
        const loginPath = getStorage("login_callback_url") || "/"
        removeStorage("login_callback_url")
        window.dispatchEvent(new CustomEvent("garu-login"))
        router.push(loginPath)
        router.refresh()
      } else {
        setStatus("error")
      }
    }

    run()
  }, [searchParams, router])

  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] border-4 border-rose-100 bg-white/95 p-8 text-center shadow-[0_20px_60px_rgba(244,63,94,0.18)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 via-orange-100 to-yellow-100 text-4xl shadow-inner">!</div>
          <div className="mb-3 inline-flex rounded-full bg-rose-100 px-4 py-1 text-xs font-black text-rose-700">もう一回ためそう</div>
          <h1 className="text-2xl font-black text-slate-700">ログインでつまずいちゃった</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-500">もう一度ログインすると直ることが多いよ。時間をおいてためしてもOK。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] border-4 border-sky-100 bg-white/95 p-8 text-center shadow-[0_20px_60px_rgba(14,116,144,0.18)]">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100 shadow-inner">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
        </div>
        <div className="mb-3 inline-flex rounded-full bg-sky-100 px-4 py-1 text-xs font-black text-sky-700">ガルちゃんが確認中</div>
        <h1 className="text-2xl font-black text-slate-700">ログインをつなげているよ！</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-500">もうすぐもとのページにもどるから、そのままちょっと待ってね。</p>
      </div>
    </div>
  )
}

export default function LoginCallBackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
      </div>
    }>
      <LoginCallBackInner />
    </Suspense>
  )
}
