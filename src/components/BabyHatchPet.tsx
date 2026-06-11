"use client"

// 自己完結の Hatch Pet スプライト・アニメーション。garoop-data の公開データを直接 fetch する。
//   pet.json: /hatch-pets/<id>/pet.json   画像: /hatch-pets/<id>/spritesheet.webp (8列x9行/基本セル192x208)
// CORS 全許可なのでクライアント直接取得でOK。

import { useEffect, useRef, useState, type CSSProperties } from "react"

const HATCH_BASE = "https://garoop-data.vercel.app"

export type HatchPetState =
  | "idle" | "running-right" | "running-left" | "waving" | "jumping"
  | "failed" | "waiting" | "running" | "review"

type Atlas = { columns: number; rows: number; cellWidth: number; cellHeight: number; width: number; height: number }
type RowDef = { state: string; row: number; frames: number }
type PetData = { id: string; displayName: string; japaneseName?: string; spritesheetUrl: string; atlas: Atlas; rows: RowDef[] }

const STATE_FPS: Partial<Record<HatchPetState, number>> = {
  idle: 6, "running-right": 12, "running-left": 12, waving: 6, jumping: 11, failed: 5, waiting: 6, running: 9, review: 6,
}

// avatarUrl (".../hatch-pets/<id>/spritesheet.webp") から pet id を取り出す。hatch-pet でなければ null。
export function hatchPetIdFromUrl(url?: string | null): string | null {
  if (!url) return null
  const m = String(url).match(/\/hatch-pets\/([^/]+)\/spritesheet\.[a-z0-9]+/i)
  return m ? m[1] : null
}

const petCache = new Map<string, PetData>()
const petInflight = new Map<string, Promise<PetData>>()

function resolveUrl(p: string): string {
  return /^https?:\/\//.test(p) ? p : `${HATCH_BASE}${p.startsWith("/") ? "" : "/"}${p}`
}

async function fetchPet(id: string): Promise<PetData> {
  const cached = petCache.get(id)
  if (cached) return cached
  const inflight = petInflight.get(id)
  if (inflight) return inflight
  const promise = fetch(`${HATCH_BASE}/hatch-pets/${id}/pet.json`).then(async (r) => {
    if (!r.ok) throw new Error(`hatch-pet ${id}: ${r.status}`)
    const d = (await r.json()) as PetData
    const norm: PetData = { ...d, spritesheetUrl: resolveUrl(d.spritesheetUrl) }
    petCache.set(id, norm)
    petInflight.delete(id)
    return norm
  })
  petInflight.set(id, promise)
  return promise
}

function rowForState(pet: PetData, state: HatchPetState): RowDef | undefined {
  return pet.rows.find((r) => r.state === state) ?? pet.rows.find((r) => r.state === "idle") ?? pet.rows[0]
}

type Props = {
  petId: string
  state?: HatchPetState
  /** 表示の高さ(px)。幅はセル比から自動算出 */
  size?: number
  fps?: number
  paused?: boolean
  className?: string
  style?: CSSProperties
}

export function BabyHatchPet({ petId, state = "idle", size = 56, fps, paused = false, className, style }: Props) {
  const [pet, setPet] = useState<PetData | null>(() => petCache.get(petId) ?? null)

  useEffect(() => {
    const cached = petCache.get(petId)
    if (cached) { setPet(cached); return }
    let alive = true
    setPet(null)
    fetchPet(petId).then((p) => { if (alive) setPet(p) }).catch(() => {})
    return () => { alive = false }
  }, [petId])

  const row = pet ? rowForState(pet, state) : undefined
  const frames = Math.max(1, row?.frames ?? 1)
  const [frame, setFrame] = useState(0)
  const frameRef = useRef(0)

  useEffect(() => { frameRef.current = 0; setFrame(0) }, [state, petId])

  useEffect(() => {
    if (paused || !pet || frames <= 1) return
    const rate = fps ?? STATE_FPS[state] ?? 8
    const t = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frames
      setFrame(frameRef.current)
    }, 1000 / rate)
    return () => clearInterval(t)
  }, [paused, pet, frames, fps, state, petId])

  if (!pet || !row) {
    return (
      <div className={className} aria-hidden
        style={{ width: size, height: size, borderRadius: "9999px", background: "linear-gradient(135deg,#fbcfe8,#e9d5ff)", opacity: 0.5, ...style }} />
    )
  }

  const { atlas } = pet
  const scale = size / atlas.cellHeight
  const cellW = atlas.cellWidth * scale
  const cellH = atlas.cellHeight * scale

  return (
    <div role="img" aria-label={pet.japaneseName || pet.displayName} className={className}
      style={{
        width: cellW, height: cellH,
        backgroundImage: `url("${pet.spritesheetUrl}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${atlas.columns * cellW}px ${atlas.rows * cellH}px`,
        backgroundPosition: `${-frame * cellW}px ${-row.row * cellH}px`,
        imageRendering: "auto",
        ...style,
      }} />
  )
}

// 汎用名のエイリアス（id を渡すと pet.json を自己取得して atlas/rows でアニメーション）
export { BabyHatchPet as HatchPet }

export default BabyHatchPet
