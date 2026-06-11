"use client"

import { useEffect, useRef, useState } from "react"
import type { PublicBaby } from "@/lib/baby-api"
import BabyHatchPet, { hatchPetIdFromUrl } from "@/components/BabyHatchPet"

const PAGE_TEXT_LIMIT = 4000
const HISTORY_KEEP = 8
const SERVICE_NAME = "Garoop Novel"

const ANIMAL_EMOJI: Record<string, string> = {
  cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊", bear: "🐻",
  panda: "🐼", wolf: "🐺", lion: "🦁", tiger: "🐯", penguin: "🐧",
  owl: "🦉", dragon: "🐲", unicorn: "🦄", bird: "🐦", hamster: "🐹",
}

function babyEmoji(animalType: string) {
  const lower = (animalType ?? "").toLowerCase()
  for (const [k, v] of Object.entries(ANIMAL_EMOJI)) {
    if (lower.includes(k)) return v
  }
  return "🐣"
}

function getPageContext() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { title: "", url: "", text: "" }
  }
  const title = document.title ?? ""
  const url = window.location.href
  const root = document.querySelector("main") ?? document.body
  const text = (root?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, PAGE_TEXT_LIMIT)
  return { title, url, text }
}

type Msg = { role: "user" | "assistant"; content: string }

interface Props {
  baby: PublicBaby
  onClose: () => void
  locale?: string
  babies?: PublicBaby[]
  activeBabyId?: string | null
  onSelectBaby?: (baby: PublicBaby) => void
  multiMode?: boolean
  onToggleMultiMode?: () => void
}

export function BabyChatDialog({
  baby,
  onClose,
  locale = "ja",
  babies = [],
  activeBabyId,
  onSelectBaby,
  multiMode,
  onToggleMultiMode,
}: Props) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const hasSwitcher = babies.length > 0 && !!onSelectBaby

  useEffect(() => {
    setMessages([])
    setError(null)
    setSwitcherOpen(false)
  }, [baby.id])

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length, loading])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setError(null)
    setInput("")
    const next: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)
    try {
      const ctx = getPageContext()
      const url = "/api/chat-with-baby"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          baby: {
            name: baby.name,
            animalType: baby.animalType,
            personality: baby.personality,
            description: baby.description,
            growthLevel: baby.growthLevel,
          },
          message: text,
          pageContext: { ...ctx, serviceName: SERVICE_NAME },
          locale,
          history: next.slice(-HISTORY_KEEP - 1, -1),
        }),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => "")
        console.warn("[BabyChatDialog]", url, "HTTP", res.status, detail)
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json().catch(() => null)
      const reply = (data?.text as string | undefined)?.trim()
      if (!reply) {
        console.warn("[BabyChatDialog] empty reply", data)
        throw new Error("No reply")
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (e) {
      console.warn("[BabyChatDialog] failed:", e)
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "じかんがかかりすぎちゃった…もういちど話しかけてね"
          : e instanceof TypeError
            ? "ネットにつながってないみたい…回線をたしかめてね"
            : "おへんじがうまく返ってこなかったよ…もう一度ためしてね"
      setError(msg)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  const emoji = babyEmoji(baby.animalType)

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md h-[100svh] sm:h-auto sm:max-h-[85svh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 shadow-2xl flex flex-col overflow-hidden border border-amber-400/30" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center gap-2 px-3 pt-4 pb-3 border-b border-amber-400/20 flex-shrink-0">
          <button
            type="button"
            onClick={() => hasSwitcher && setSwitcherOpen((v) => !v)}
            disabled={!hasSwitcher}
            aria-expanded={switcherOpen}
            className={`flex items-center gap-3 flex-1 min-w-0 px-2 py-1 -mx-1 rounded-2xl text-left transition-colors ${
              hasSwitcher ? "active:bg-amber-400/20 hover:bg-amber-400/10 cursor-pointer" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 overflow-hidden">
              {hatchPetIdFromUrl(baby.avatarUrl) ? (
                <BabyHatchPet petId={hatchPetIdFromUrl(baby.avatarUrl)!} state="idle" size={38} />
              ) : (
                emoji
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-amber-200 font-black text-sm truncate">{baby.name}</span>
              <span className="text-[10px] text-amber-400/70 font-bold truncate">
                {baby.animalType} · Lv.{Math.floor((baby.growthLevel ?? 0) / 10) + 1}
              </span>
            </div>
            {hasSwitcher && (
              <span
                className={`flex items-center gap-0.5 text-amber-300 text-[10px] font-black px-2 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 flex-shrink-0 transition-transform ${
                  switcherOpen ? "rotate-180" : ""
                }`}
              >
                <span className="text-sm leading-none">▾</span>
                <span className="leading-none">{babies.length}</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full text-amber-300 hover:bg-amber-400/10 flex items-center justify-center flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {hasSwitcher && switcherOpen && (
          <div className="flex-shrink-0 border-b border-amber-400/20 bg-slate-900/60 max-h-[40svh] overflow-y-auto">
            {onToggleMultiMode && (
              <button
                type="button"
                onClick={onToggleMultiMode}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-amber-400/20 transition-colors ${
                  multiMode ? "bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20" : "bg-transparent hover:bg-amber-400/10"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">👶👶👶</span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-black text-amber-200 leading-tight">みんな表示モード</span>
                    <span className="text-[9px] font-bold text-amber-400/70 leading-tight">全員いっしょに画面に出る</span>
                  </span>
                </span>
                <span
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    multiMode ? "bg-amber-400" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-900 shadow transition-all ${
                      multiMode ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            )}

            <div className="px-3 py-2 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-amber-400/70 px-1 mb-1">他の子に切り替え</div>
              {babies.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBaby?.(b)}
                  className={`flex items-center gap-2 p-1.5 rounded-2xl active:scale-[0.98] transition-all ${
                    b.id === activeBabyId
                      ? "bg-amber-400/20 border border-amber-400/40"
                      : "bg-slate-800 border border-amber-400/15 hover:bg-amber-400/10"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 flex items-center justify-center text-base flex-shrink-0">
                    {babyEmoji(b.animalType)}
                  </span>
                  <span className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-xs font-black text-amber-200 truncate w-full text-left">{b.name}</span>
                    <span className="text-[9px] text-amber-400/70 font-bold truncate w-full text-left">
                      {b.animalType} · Lv.{Math.floor((b.growthLevel ?? 0) / 10) + 1}
                    </span>
                  </span>
                  {b.id === activeBabyId && (
                    <span className="text-[8px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full flex-shrink-0">いま</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {messages.length === 0 && !loading && (
            <div className="m-auto text-center px-4">
              <div className="text-4xl mb-2">{emoji}</div>
              <p className="text-sm font-bold text-amber-200">{baby.name}に話しかけてみよう</p>
              <p className="text-[11px] text-amber-400/70 mt-1">今ひらいているページのことを聞くと教えてくれるよ</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-base mr-1 mt-1 flex-shrink-0">
                  {emoji}
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-amber-500 to-fuchsia-500 text-white rounded-br-sm"
                    : "bg-slate-800/80 text-amber-100 border border-amber-400/20 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-base mr-1 mt-1 flex-shrink-0">
                {emoji}
              </div>
              <div className="bg-slate-800/80 border border-amber-400/20 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-amber-300/70 shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="self-center text-[11px] text-rose-300 bg-rose-900/40 border border-rose-500/40 px-3 py-1 rounded-full">
              {error}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-amber-400/20 bg-slate-900/80 backdrop-blur-sm px-3 py-3 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`${baby.name}に話しかける`}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-amber-400/30 bg-slate-800/60 px-3 py-2 text-sm text-amber-100 placeholder:text-amber-300/40 focus:border-amber-300 focus:outline-none max-h-28"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 h-10 px-4 rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white font-black text-sm shadow active:scale-95 transition-transform disabled:opacity-40"
          >
            送る
          </button>
        </div>
      </div>
    </div>
  )
}
