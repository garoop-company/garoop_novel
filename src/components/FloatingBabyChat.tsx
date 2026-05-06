"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getMyBabies, type PublicBaby } from "@/lib/baby-api"
import { BabyChatDialog } from "./BabyChatDialog"

// ─────────────────────────────────────────────────────────────────────
// Floating baby companion (v2)
//   - 単一モード: アクティブな1人を表示 / 切替トグルで「みんな表示モード」
//   - クリック (or タップ) ですぐドラッグ移動 (長押し不要)
//   - 動かさずにポインタを離した = チャットダイアログを開く
//   - 位置は赤ちゃんごとに sessionStorage に保存
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

const POS_KEY = "garu-baby-positions-v2"
const ACTIVE_KEY = "garu-baby-active-v2"
const MULTI_KEY = "garu-baby-multi-v2"
const SIZE = 56
const MARGIN = 12
const TAP_MOVE_TOLERANCE = 6
const WANDER_INTERVAL_MS = 5000

type Pos = { x: number; y: number }

function clamp(p: Pos): Pos {
  if (typeof window === "undefined") return p
  const maxX = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN)
  const maxY = Math.max(MARGIN, window.innerHeight - SIZE - MARGIN)
  return {
    x: Math.min(maxX, Math.max(MARGIN, p.x)),
    y: Math.min(maxY, Math.max(MARGIN, p.y)),
  }
}

function readPositions(): Record<string, Pos> {
  if (typeof sessionStorage === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(POS_KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return obj && typeof obj === "object" ? (obj as Record<string, Pos>) : {}
  } catch { return {} }
}
function writePositions(p: Record<string, Pos>) {
  if (typeof sessionStorage === "undefined") return
  try { sessionStorage.setItem(POS_KEY, JSON.stringify(p)) } catch { /* quota */ }
}
function readActiveId() {
  if (typeof sessionStorage === "undefined") return null
  return sessionStorage.getItem(ACTIVE_KEY)
}
function writeActiveId(id: string | null) {
  if (typeof sessionStorage === "undefined") return
  if (id) sessionStorage.setItem(ACTIVE_KEY, id)
  else sessionStorage.removeItem(ACTIVE_KEY)
}
function readMulti() {
  if (typeof sessionStorage === "undefined") return false
  return sessionStorage.getItem(MULTI_KEY) === "true"
}
function writeMulti(v: boolean) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(MULTI_KEY, v ? "true" : "false")
}

function defaultPosFor(index: number): Pos {
  if (typeof window === "undefined") return { x: 24, y: 24 }
  const cellW = 76
  const cellH = 76
  const cols = Math.max(1, Math.floor((window.innerWidth - 48) / cellW))
  const col = index % cols
  const row = Math.floor(index / cols)
  const x = window.innerWidth - SIZE - 24 - col * cellW
  const y = window.innerHeight - SIZE - 24 - row * cellH
  return clamp({ x, y })
}

const COMPANION_CSS = `
@keyframes garu-baby-hop {
  0%, 60%, 100% { transform: translateY(0) scale(1, 1); }
  65% { transform: translateY(0) scale(1.1, 0.9); }
  78% { transform: translateY(-12px) scale(0.94, 1.06); }
  88% { transform: translateY(-2px) scale(1.04, 0.96); }
  95% { transform: translateY(0) scale(1, 1); }
}
.garu-baby-hop { animation: garu-baby-hop 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
.garu-baby-dragging { transform: scale(1.18); transform-origin: 50% 50%; }
@keyframes garu-baby-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
  50% { box-shadow: 0 0 0 14px rgba(251, 191, 36, 0); }
}
.garu-baby-dragging-glow { animation: garu-baby-glow 1s ease-out infinite; }
`

interface BabyDotProps {
  baby: PublicBaby
  pos: Pos
  hopDelay: number
  isActive: boolean
  isDragging: boolean
  onUpdatePos: (p: Pos) => void
  onTap: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

function BabyDot({ baby, pos, hopDelay, isActive, isDragging, onUpdatePos, onTap, onDragStart, onDragEnd }: BabyDotProps) {
  const pointerStart = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const draggingRef = useRef(false)
  draggingRef.current = isDragging

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false }
    try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const start = pointerStart.current
    if (!start) return
    const dx = e.clientX - start.sx
    const dy = e.clientY - start.sy
    if (!start.moved && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) {
      start.moved = true
      onDragStart()
    }
    if (start.moved || draggingRef.current) {
      onUpdatePos(clamp({ x: start.ox + dx, y: start.oy + dy }))
    }
  }
  const finishPointer = (e: React.PointerEvent) => {
    const start = pointerStart.current
    pointerStart.current = null
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
    if (draggingRef.current) {
      onDragEnd()
      return
    }
    if (start && !start.moved) onTap()
  }

  const transition = isDragging
    ? "none"
    : "left 1.4s cubic-bezier(0.34,1.56,0.64,1), top 1.4s cubic-bezier(0.34,1.56,0.64,1)"

  return (
    <div
      role="button"
      aria-label={`${baby.name}に話しかける`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onTap()
        }
      }}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        touchAction: "none",
        transition,
        zIndex: 60,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      className="select-none"
    >
      <div
        className={`relative w-full h-full ${isDragging ? "garu-baby-dragging" : "garu-baby-hop"}`}
        style={{ animationDelay: isDragging ? undefined : `${hopDelay}ms` }}
      >
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${
            isActive
              ? "from-pink-300 via-pink-400 to-purple-500"
              : "from-violet-200 via-pink-200 to-purple-300"
          } shadow-2xl flex items-center justify-center text-2xl ring-4 ${
            isActive ? "ring-white/85" : "ring-white/55"
          } ${isDragging ? "garu-baby-dragging-glow" : ""}`}
        >
          <span className="drop-shadow">{babyEmoji(baby.animalType)}</span>
        </div>
        <span
          className={`absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-0.5 rounded-full text-[10px] font-black shadow whitespace-nowrap pointer-events-none ${
            isDragging
              ? "bg-amber-400 text-white"
              : "bg-white/95 text-pink-600 border border-pink-100"
          }`}
        >
          {isDragging ? "つかまえた!" : baby.name}
        </span>
      </div>
    </div>
  )
}

export function FloatingBabyChat() {
  const [babies, setBabies] = useState<PublicBaby[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [chatBaby, setChatBaby] = useState<PublicBaby | null>(null)
  const [multiMode, setMultiMode] = useState(false)
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // 初回ロード: localStorage 復元
  useEffect(() => {
    setPositions(readPositions())
    setActiveId(readActiveId())
    setMultiMode(readMulti())
  }, [])

  const load = useCallback(async () => {
    const isLogin = typeof window !== "undefined" && sessionStorage.getItem("isLogin") === "true"
    if (!isLogin) return
    const list = await getMyBabies()
    setBabies(list)
    setActiveId((prev) => (prev && list.find((b) => b.id === prev) ? prev : list[0]?.id ?? null))
  }, [])

  useEffect(() => {
    load()
    const onLogin = () => load()
    window.addEventListener("garu-login", onLogin)
    return () => window.removeEventListener("garu-login", onLogin)
  }, [load])

  // 新しい赤ちゃんが居たら初期位置を割り当てる
  useEffect(() => {
    if (babies.length === 0) return
    setPositions((prev) => {
      const next = { ...prev }
      let changed = false
      babies.forEach((b, i) => {
        if (!next[b.id]) {
          next[b.id] = defaultPosFor(i)
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [babies])

  useEffect(() => { writePositions(positions) }, [positions])
  useEffect(() => { writeActiveId(activeId) }, [activeId])
  useEffect(() => { writeMulti(multiMode) }, [multiMode])

  // 表示中の赤ちゃん (ID リスト)
  const visibleBabies = multiMode ? babies : babies.filter((b) => b.id === activeId)
  const visibleIds = visibleBabies.map((b) => b.id).join(",")

  // ゆっくりお散歩
  useEffect(() => {
    if (chatBaby) return
    if (visibleIds.length === 0) return
    const id = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev }
        let changed = false
        visibleIds.split(",").forEach((bid) => {
          if (!bid || bid === draggingId) return
          const cur = next[bid]
          if (!cur) return
          const dx = (Math.random() - 0.5) * 220
          const dy = (Math.random() - 0.5) * 120
          const newPos = clamp({ x: cur.x + dx, y: cur.y + dy })
          if (newPos.x !== cur.x || newPos.y !== cur.y) {
            next[bid] = newPos
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, WANDER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [visibleIds, chatBaby, draggingId])

  // ウィンドウリサイズで画面外に出ないように clamp
  useEffect(() => {
    const handle = () => {
      setPositions((prev) => {
        const next: Record<string, Pos> = {}
        for (const k in prev) next[k] = clamp(prev[k])
        return next
      })
    }
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [])

  if (babies.length === 0) return null

  const updatePos = (id: string, p: Pos) =>
    setPositions((prev) => ({ ...prev, [id]: p }))

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COMPANION_CSS }} />

      {visibleBabies.map((b, i) => (
        <BabyDot
          key={b.id}
          baby={b}
          pos={positions[b.id] ?? defaultPosFor(i)}
          hopDelay={(i * 230) % 1300}
          isActive={b.id === activeId}
          isDragging={draggingId === b.id}
          onUpdatePos={(p) => updatePos(b.id, p)}
          onDragStart={() => setDraggingId(b.id)}
          onDragEnd={() => setDraggingId(null)}
          onTap={() => {
            setActiveId(b.id)
            setChatBaby(b)
          }}
        />
      ))}

      {chatBaby && (
        <BabyChatDialog
          baby={chatBaby}
          onClose={() => setChatBaby(null)}
          babies={babies}
          activeBabyId={activeId}
          onSelectBaby={(b) => {
            setActiveId(b.id)
            setChatBaby(b)
          }}
          multiMode={multiMode}
          onToggleMultiMode={() => setMultiMode((m) => !m)}
        />
      )}
    </>
  )
}
