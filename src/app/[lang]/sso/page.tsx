"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exchangeSessionTransferToken } from "@/lib/baby-api"

// Open Redirect 防止: 内部パス (`/foo`) のみ許可。
// 外部 URL / protocol-relative (`//evil.com`) / バックスラッシュ系小細工 / javascript: 等は弾く。
function safeRedirect(raw: string | null): string {
  if (!raw) return "/"
  if (!raw.startsWith("/")) return "/"
  if (raw.startsWith("//")) return "/"
  if (raw.includes("\\")) return "/"
  return raw
}

function SsoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(false)
  const consumed = useRef(false)

  useEffect(() => {
    if (consumed.current) return
    const token = searchParams.get("token")
    const redirect = safeRedirect(searchParams.get("redirect"))
    if (!token) {
      setError(true)
      return
    }
    consumed.current = true

    exchangeSessionTransferToken(token)
      .then((result) => {
        if (result?.success && result.id) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("isLogin", "true")
            sessionStorage.setItem("garoopLoginUserId", result.id)
            window.dispatchEvent(new CustomEvent("garu-login"))
          }
          router.replace(redirect)
          router.refresh()
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [searchParams, router])

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "#DC2626", fontWeight: "bold" }}>
          ログイン引き継ぎに失敗しました。もう一度お試しください。
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <p style={{ color: "#FF8C00", fontWeight: "bold" }}>ログインをつなげているよ！</p>
    </div>
  )
}

export default function SsoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <SsoInner />
    </Suspense>
  )
}
