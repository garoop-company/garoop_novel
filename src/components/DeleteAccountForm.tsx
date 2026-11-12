"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { AccountDeleteCopy } from "@/lib/account-delete"
import { deleteAccount, DELETE_CONFIRMATION, getLoginUser, type GaruLoginUser } from "@/lib/baby-api"

const GaruLoginModal = dynamic(() => import("./GaruLoginModal").then((m) => m.GaruLoginModal))

/**
 * アカウント削除のフォーム。ログイン中の人だけが使える。
 * 誤操作よけに、確認の語（DELETE）の入力と、同意のチェックの両方を求める。
 * ログイン状態の見かたは Header と同じ（getLoginUser と "garu-login" イベント）。
 */
export default function DeleteAccountForm({ copy, homeHref }: { copy: AccountDeleteCopy; homeHref: string }) {
  // undefined: 確認中 / null: 未ログイン
  const [user, setUser] = useState<GaruLoginUser | null | undefined>(undefined)
  const [showLogin, setShowLogin] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [passcode, setPasscode] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    const check = async () => {
      const u = await getLoginUser()
      if (alive) setUser(u)
    }
    check()
    window.addEventListener("garu-login", check)
    return () => {
      alive = false
      window.removeEventListener("garu-login", check)
    }
  }, [])

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/40 p-6 text-center" role="status">
        <p className="font-bold text-emerald-200">{copy.done}</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">{copy.doneBody}</p>
        <Link href={homeHref} className="mt-4 inline-flex h-11 items-center rounded-full bg-amber-300 px-6 text-sm font-bold text-stone-900 hover:bg-amber-200 transition">
          Garoop Novel
        </Link>
      </div>
    )
  }

  if (user === undefined) return <div className="h-32 animate-pulse rounded-lg bg-slate-800/60" />

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 text-center">
        {showLogin && (
          <GaruLoginModal
            onClose={() => setShowLogin(false)}
            onLogin={(u) => {
              setUser(u)
              setShowLogin(false)
            }}
          />
        )}
        <p className="text-sm leading-relaxed text-slate-300">{copy.loginFirst}</p>
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          className="mt-4 h-11 rounded-full bg-amber-300 px-6 text-sm font-bold text-stone-900 shadow hover:bg-amber-200 transition active:scale-[.98]"
        >
          {copy.login}
        </button>
      </div>
    )
  }

  const ready = confirmation === DELETE_CONFIRMATION && agreed && !busy

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!ready) return
        setBusy(true)
        setError(null)
        const r = await deleteAccount(confirmation, passcode)
        setBusy(false)
        if (r.ok) {
          setDone(true)
          // kids_api がセッションを消したので、ブラウザ側もログアウト時と同じく消してヘッダーを更新させる
          // （Header の handleLogout と同じ手順）
          sessionStorage.removeItem("isLogin")
          sessionStorage.removeItem("garoopLoginUserId")
          window.dispatchEvent(new CustomEvent("garu-login"))
          return
        }
        setError(copy.errors[r.code ?? ""] ?? copy.errors.backend_error)
      }}
      className="grid gap-5 rounded-lg border border-rose-900/60 bg-slate-900/70 p-6"
    >
      <p className="text-sm font-bold text-slate-200">{copy.signedInAs.replace("{name}", user.name || "—")}</p>

      <label className="grid gap-1 text-sm font-bold text-slate-200">
        {copy.confirmLabel}
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={DELETE_CONFIRMATION}
          className="h-12 rounded-md border border-slate-700 bg-slate-950 px-4 font-mono text-base tracking-widest text-slate-100 outline-none placeholder:text-slate-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40"
        />
        <span className="text-xs font-normal text-slate-400">{copy.confirmHint}</span>
      </label>

      <label className="grid gap-1 text-sm font-bold text-slate-200">
        {copy.passcodeLabel}
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoComplete="off"
          inputMode="numeric"
          className="h-12 rounded-md border border-slate-700 bg-slate-950 px-4 text-base text-slate-100 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40"
        />
        <span className="text-xs font-normal text-slate-400">{copy.passcodeHint}</span>
      </label>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-200">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-rose-500" />
        {copy.agree}
      </label>

      {error && (
        <p className="rounded-md border border-red-800/60 bg-red-950/50 p-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready}
        className="h-12 rounded-full bg-rose-600 text-base font-bold text-white shadow-md transition hover:bg-rose-500 active:scale-[.98] disabled:opacity-40 disabled:hover:bg-rose-600"
      >
        {busy ? copy.deleting : copy.submit}
      </button>
    </form>
  )
}
