"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getMyBabies, type PublicBaby } from "@/lib/baby-api"
import { BabyChatDialog } from "./BabyChatDialog"

// ─────────────────────────────────────────────────────────────────────
// Floating baby companion
//   - 常時画面に表示 (ぴょんぴょんアイドル & ゆっくりお散歩)
//   - 短いタップ → BabyChatDialog でチャット
//   - 長押し (LONG_PRESS_MS) → "つかまえた" 状態 → ドラッグで自由に移動
//   - 位置は sessionStorage に保存 (ページ遷移をまたいで保持)
//   - 未ログインなら表示しない (赤ちゃんが居ないので)
// ─────────────────────────────────────────────────────────────────────

const ANIMAL_EMOJI: Record<string, string> = {
  cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊", bear: "🐻",
  panda: "🐼", wolf: "🐺", lion: "🦁", tiger: "🐯", penguin: "🐧",
  owl: "🦉", dragon: "🐲", unicorn: "🦄", bird: "🐦", hamster: "🐹",
}

function babyEmoji(animalType?: string | null) {
  const lower = (animalType ?? "").toLowerCase()
  for (const [k, v] of Object.entries(ANIMAL_EMOJI)) {
    if (lower.includes(k)) return v
  }
  return "🐣"
}

const POS_KEY = "garu-baby-pos-v1"
const SIZE = 64
const MARGIN = 12
const LONG_PRESS_MS = 380
const TAP_MOVE_TOLERANCE = 8
const WANDER_INTERVAL_MS = 4500

function clamp(x: number, y: number) {
  if (typeof window === "undefined") return { x, y }
  const maxX = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN)
  const maxY = Math.max(MARGIN, window.innerHeight - SIZE - MARGIN)
  return {
    x: Math.min(maxX, Math.max(MARGIN, x)),
    y: Math.min(maxY, Math.max(MARGIN, y)),
  }
}

function readPos() {
  if (typeof sessionStorage === "undefined") return null
  try {
    const raw = sessionStorage.getItem(POS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p?.x !== "number" || typeof p?.y !== "number") return null
    return p as { x: number; y: number }
  } catch { return null }
}

function writePos(p: { x: number; y: number }) {
  if (typeof sessionStorage === "undefined") return
  try { sessionStorage.setItem(POS_KEY, JSON.stringify(p)) } catch { /* quota */ }
}

const COMPANION_CSS = `
@keyframes garu-baby-hop {
  0%, 60%, 100% { transform: translateY(0) scale(1, 1); }
  65% { transform: translateY(0) scale(1.12, 0.88); }
  78% { transform: translateY(-14px) scale(0.94, 1.06); }
  88% { transform: translateY(-2px) scale(1.04, 0.96); }
  95% { transform: translateY(0) scale(1, 1); }
}
.garu-baby-hop { animation: garu-baby-hop 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
.garu-baby-grabbed { transform: scale(1.18); transform-origin: 50% 50%; }
@keyframes garu-baby-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
  50% { box-shadow: 0 0 0 16px rgba(251, 191, 36, 0); }
}
.garu-baby-grabbed-glow { animation: garu-baby-pulse 1s ease-out infinite; }
@keyframes garu-baby-wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(6deg); }
}
.garu-baby-wiggle { animation: garu-baby-wiggle 0.45s ease-in-out infinite; }
`

export function FloatingBabyChat() {
  const [babies, setBabies] = useState<PublicBaby[]>([])
  const [activeBaby, setActiveBaby] = useState<PublicBaby | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 })
  const [grabbed, setGrabbed] = useState(false)
  const [pressing, setPressing] = useState(false)
  const grabbedRef = useRef(false)
  grabbedRef.current = grabbed

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerStart = useRef<
    { sx: number; sy: number; ox: number; oy: number; moved: boolean } | null
  >(null)

  // 初回マウント: 保存位置 or 右下デフォルト
  useEffect(() => {
    const saved = readPos()
    setPos(saved
      ? clamp(saved.x, saved.y)
      : clamp(window.innerWidth - SIZE - 24, window.innerHeight - SIZE - 24))
  }, [])

  const load = useCallback(async () => {
    const isLogin = typeof window !== "undefined" && sessionStorage.getItem("isLogin") === "true"
    if (!isLogin) return
    const list = await getMyBabies()
    setBabies(list)
    setActiveBaby((prev) => prev ?? list[0] ?? null)
  }, [])

  useEffect(() => {
    load()
    const onLogin = () => load()
    window.addEventListener("garu-login", onLogin)
    return () => window.removeEventListener("garu-login", onLogin)
  }, [load])

  // アイドルお散歩 (掴まれて居る間 / チャット中は止める)
  useEffect(() => {
    if (grabbed || chatOpen || pickerOpen) return
    const id = setInterval(() => {
      setPos((prev) => {
        const dx = (Math.random() - 0.5) * 220
        const dy = (Math.random() - 0.5) * 120
        return clamp(prev.x + dx, prev.y + dy)
      })
    }, WANDER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [grabbed, chatOpen, pickerOpen])

  useEffect(() => { writePos(pos) }, [pos])

  useEffect(() => {
    const handle = () => setPos((p) => clamp(p.x, p.y))
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false }
    setPressing(true)
    longPressTimer.current = setTimeout(() => {
      setGrabbed(true)
      // 触覚フィードバック (対応端末のみ)
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(15) } catch { /* ignore */ }
      }
    }, LONG_PRESS_MS)
    try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const start = pointerStart.current
    if (!start) return
    const dx = e.clientX - start.sx
    const dy = e.clientY - start.sy
    if (!start.moved && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) {
      start.moved = true
      // 長押し前に動いたらタップとして扱うため、長押しタイマーを止める
      if (!grabbedRef.current && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
    if (grabbedRef.current) {
      setPos(clamp(start.ox + dx, start.oy + dy))
    }
  }

  const finishPointer = (e: React.PointerEvent) => {
    const start = pointerStart.current
    pointerStart.current = null
    setPressing(false)
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }

    if (grabbedRef.current) {
      setGrabbed(false)
      return
    }
    if (start && !start.moved) {
      if (babies.length > 1) setPickerOpen(true)
      else setChatOpen(true)
    }
  }

  if (!activeBaby) return null

  const wrapperTransition = grabbed
    ? "none"
    : "left 1.4s cubic-bezier(0.34, 1.56, 0.64, 1), top 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)"

  const animClass = grabbed
    ? "garu-baby-grabbed"
    : pressing
      ? "garu-baby-wiggle"
      : "garu-baby-hop"

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COMPANION_CSS }} />
      <div
        role="button"
        aria-label={`${activeBaby.name}に話しかける`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (babies.length > 1) setPickerOpen(true)
            else setChatOpen(true)
          }
        }}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: SIZE,
          height: SIZE,
          touchAction: "none",
          transition: wrapperTransition,
          zIndex: 60,
          cursor: grabbed ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        className="select-none"
      >
        <div className={`relative w-full h-full ${animClass}`}>
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br from-pink-300 via-pink-400 to-purple-500 shadow-2xl flex items-center justify-center text-3xl ring-4 ring-white/80 ${
              grabbed ? "garu-baby-grabbed-glow" : ""
            }`}
          >
            <span className="drop-shadow">{babyEmoji(activeBaby.animalType)}</span>
          </div>
          <span
            className={`absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-0.5 rounded-full text-[10px] font-black shadow whitespace-nowrap pointer-events-none ${
              grabbed
                ? "bg-amber-400 text-white"
                : "bg-white/95 text-pink-600 border border-pink-100"
            }`}
          >
            {grabbed ? "つかまえた!" : activeBaby.name}
          </span>
        </div>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPickerOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-xs bg-white rounded-3xl shadow-2xl p-4">
            <div className="text-xs font-black text-pink-500 uppercase tracking-widest text-center mb-3">どの子に話す?</div>
            <div className="flex flex-col gap-2 max-h-[60dvh] overflow-y-auto">
              {babies.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBaby(b); setPickerOpen(false); setChatOpen(true) }}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-pink-50 active:scale-[0.98] transition-all border border-pink-100"
                >
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                    {babyEmoji(b.animalType)}
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-black text-pink-700 truncate max-w-[180px]">{b.name}</span>
                    <span className="text-[10px] text-pink-400 font-bold truncate max-w-[180px]">{b.animalType}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {chatOpen && activeBaby && (
        <BabyChatDialog baby={activeBaby} onClose={() => setChatOpen(false)} />
      )}
    </>
  )
}
