"use client"

import { useEffect, useRef, useState } from "react"
import type { PublicBaby } from "@/lib/baby-api"

const GARUCHAN_API =
  process.env.NEXT_PUBLIC_GARUCHAN_URL?.replace(/\/$/, "") ?? "https://garu.garoop.jp"

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
}

export function BabyChatDialog({ baby, onClose, locale = "ja" }: Props) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

    try {
      const ctx = getPageContext()
      const res = await fetch(`${GARUCHAN_API}/api/chat-with-baby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const reply = (data?.text as string | undefined)?.trim()
      if (!reply) throw new Error("No reply")
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (e) {
      console.warn("[BabyChatDialog] failed:", e)
      setError("おへんじが返ってこなかったよ…もう一度ためしてね")
    } finally {
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
      <div className="relative z-10 w-full sm:max-w-md h-[88dvh] sm:h-[80dvh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 shadow-2xl flex flex-col overflow-hidden border border-amber-400/30">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-amber-400/20 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 flex items-center justify-center text-2xl shadow-inner">
            {emoji}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-amber-200 font-black text-sm truncate">{baby.name}</span>
            <span className="text-[10px] text-amber-400/70 font-bold truncate">
              {baby.animalType} · Lv.{Math.floor((baby.growthLevel ?? 0) / 10) + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full text-amber-300 hover:bg-amber-400/10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

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
