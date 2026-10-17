"use client"

// 自己完結の Hatch Pet スプライト・アニメーション。garoop-data の公開データを直接 fetch する。
//   pet.json: /hatch-pets/<id>/pet.json   画像: /hatch-pets/<id>/spritesheet.webp (8列x9行/基本セル192x208)
// CORS 全許可なのでクライアント直接取得でOK。

import { useEffect, useState, type CSSProperties } from "react"
import { useSpriteAnimation } from "@/lib/sprite-motion"

const HATCH_BASE = "https://data.garoop.jp"

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
  /** auto: 「うごかす」ON の間は常時再生 / tap: タップ・ホバーした時だけ短く再生（一覧など多数表示向け） */
  playMode?: "auto" | "tap"
  className?: string
  style?: CSSProperties
}

export function BabyHatchPet({ petId, state = "idle", size = 56, fps, paused = false, playMode = "auto", className, style }: Props) {
  // 取得結果は petId と組で持ち、キャッシュ済みならそのまま使う（effect 内で同期 setState しない）
  const [loaded, setLoaded] = useState<{ id: string; pet: PetData } | null>(null)
  const pet = petCache.get(petId) ?? (loaded?.id === petId ? loaded.pet : null)

  useEffect(() => {
    if (petCache.has(petId)) return
    let alive = true
    fetchPet(petId).then((p) => { if (alive) setLoaded({ id: petId, pet: p }) }).catch(() => {})
    return () => { alive = false }
  }, [petId])

  const row = pet ? rowForState(pet, state) : undefined
  const frames = Math.max(1, row?.frames ?? 1)
  const scale = pet ? size / pet.atlas.cellHeight : 1
  const cellW = pet ? pet.atlas.cellWidth * scale : size
  const cellH = pet ? pet.atlas.cellHeight * scale : size
  const rowIndex = row?.row ?? 0

  // フレーム送りは DOM を直接更新（再レンダーなし）。画面外・タブ非表示・「うごかす」OFF では止まる
  const { ref, activate } = useSpriteAnimation({
    frames,
    fps: fps ?? STATE_FPS[state] ?? 8,
    mode: playMode,
    paused,
    resetKey: `${petId}:${state}:${size}`,
    position: (f) => `${-f * cellW}px ${-rowIndex * cellH}px`,
  })

  if (!pet || !row) {
    return (
      <div className={className} aria-hidden
        style={{ width: size, height: size, borderRadius: "9999px", background: "linear-gradient(135deg,#fbcfe8,#e9d5ff)", opacity: 0.5, ...style }} />
    )
  }

  const { atlas } = pet

  return (
    <div ref={ref} role="img" aria-label={pet.japaneseName || pet.displayName} className={className}
      onClick={activate}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") activate() }}
      style={{
        width: cellW, height: cellH,
        backgroundImage: `url("${pet.spritesheetUrl}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${atlas.columns * cellW}px ${atlas.rows * cellH}px`,
        backgroundPosition: `0px ${-row.row * cellH}px`,
        imageRendering: "auto",
        ...style,
      }} />
  )
}

// 汎用名のエイリアス（id を渡すと pet.json を自己取得して atlas/rows でアニメーション）
export { BabyHatchPet as HatchPet }

export default BabyHatchPet
